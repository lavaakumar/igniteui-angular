import { async, TestBed } from '@angular/core/testing';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridModule } from '../../grid';
import { IgxGridComponent } from '../../grid/grid.component';
import { FileContentData } from '../excel/test-data.service.spec';
import { IColumnExportingEventArgs, IRowExportingEventArgs } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { TestMethods } from '../exporter-common/test-methods.spec';
import { IgxCsvExporterService } from './csv-exporter';
import { CsvFileTypes, IgxCsvExporterOptions } from './csv-exporter-options';
import { CSVWrapper } from './csv-verification-wrapper.spec';
import { IgxStringFilteringOperand } from '../../../public_api';
import { ReorderedColumnsComponent, GridIDNameJobTitleComponent } from '../../test-utils/grid-samples.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('CSV Grid Exporter', () => {
    let exporter: IgxCsvExporterService;
    let actualData: FileContentData;
    let options: IgxCsvExporterOptions;
    const data = SampleTestData.personJobData;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ReorderedColumnsComponent,
                GridIDNameJobTitleComponent
            ],
            imports: [IgxGridModule.forRoot()]
        })
        .compileComponents().then(() => {
            exporter = new IgxCsvExporterService();
            actualData = new FileContentData();
            options = new IgxCsvExporterOptions('CsvGridExport', CsvFileTypes.CSV);

            // Spy the saveBlobToFile method so the files are not really created
            spyOn(ExportUtilities as any, 'saveBlobToFile');
        });
    }));

    it('should export grid as displayed.', async(() => {
        const currentGrid: IgxGridComponent = null;
        TestMethods.testRawData(currentGrid, (grid) => {
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.simpleGridData);
            });
        });
    }));

    it('should honor \'ignoreFiltering\' option.', async(() => {

        const result = TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;

        options = new IgxCsvExporterOptions('TestCsv', CsvFileTypes.CSV);
        options.ignoreFiltering = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.gridOneSeniorDev, 'One row only should have been exported!');

                options.ignoreFiltering = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyData(wrapper2.simpleGridData, 'All 10 rows should have been exported!');
                });
            });
        });
    }));

    it('should honor filter criteria changes.', async(() => {

        const result = TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;

        expect(grid.rowList.length).toEqual(1);

        fix.whenStable().then(() => {

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.gridOneSeniorDev, 'One row should have been exported!');

                grid.filter('JobTitle', 'Director', IgxStringFilteringOperand.instance().condition('equals'), true);
                fix.detectChanges();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.rowList.length).toEqual(2, 'Invalid number of rows after filtering!');
                    getExportedData(grid, options).then((wrapper2) => {
                        wrapper2.verifyData(wrapper2.gridTwoDirectors, 'Two rows should have been exported!');
                    });
                });
            });
        });
    }));

    it('should honor \'ignoreColumnsVisibility\' option.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        grid.columns[0].hidden = true;
        options.ignoreColumnsOrder = true;
        options.ignoreColumnsVisibility = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.gridNameJobTitle, 'Two columns data should have been exported!');

                options.ignoreColumnsVisibility = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyData(wrapper2.simpleGridData, 'All three columns data should have been exported!');
                });
            });
        });
    }));

    it('should honor columns visibility changes.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        options.ignoreColumnsOrder = true;

        fix.whenStable().then(() => {
            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.simpleGridData, 'All columns data should have been exported!');

                grid.columns[0].hidden = true;
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.visibleColumns.length).toEqual(2, 'Invalid number of visible columns!');
                    getExportedData(grid, options).then((wrapper2) => {
                        wrapper2.verifyData(wrapper2.gridNameJobTitle, 'Two columns data should have been exported!');

                        grid.columns[0].hidden = false;
                        fix.whenStable().then(() => {
                            fix.detectChanges();
                            expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
                            getExportedData(grid, options).then((wrapper3) => {
                                wrapper3.verifyData(wrapper3.simpleGridData, 'All columns data should have been exported!');

                                grid.columns[0].hidden = undefined;
                                fix.whenStable().then(() => {
                                    fix.detectChanges();
                                    expect(grid.visibleColumns.length).toEqual(3, 'Invalid number of visible columns!');
                                    getExportedData(grid, options).then((wrapper4) => {
                                        wrapper4.verifyData(wrapper4.simpleGridData,
                                            'All columns data should have been exported!');

                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }));

    it('should honor columns declaration order.', async(() => {
        const fix = TestBed.createComponent(ReorderedColumnsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.gridNameJobTitleID);
            });
        });
    }));

    it('should honor applied sorting.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true});

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.sortedSimpleGridData);
            });
        });
    }));

    it('should honor changes in applied sorting.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.sort({fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: true});

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.sortedSimpleGridData);

                grid.sort({fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: true});

                fix.whenStable().then(() => {
                    fix.detectChanges();
                    getExportedData(grid, options).then((wrapper2) => {
                        wrapper2.verifyData(wrapper2.sortedDescSimpleGridData);
                        grid.clearSort();
                        grid.sort({fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: true});

                        fix.whenStable().then(() => {
                            fix.detectChanges();
                            getExportedData(grid, options).then((wrapper3) => {
                                wrapper3.verifyData(wrapper3.simpleGridData);
                            });
                        });
                    });
                });
            });
        });
    }));

    it('should display pinned columns data in the beginning.', async(() => {
        const result = TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.gridNameIDJobTitle, 'Name should have been the first field!');
            });
        });
    }));

    it('should not display pinned columns data first when ignoreColumnsOrder is true.', async(() => {
        const result = TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;
        options.ignoreColumnsOrder = true;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData(wrapper.simpleGridData, 'Name should not have been the first field!');
            });
        });
    }));

    it('should fire \'onColumnExport\' for each grid column.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        const cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                expect(cols.length).toBe(3);
                expect(cols[0].header).toBe('ID');
                expect(cols[0].index).toBe(0);
                expect(cols[1].header).toBe('Name');
                expect(cols[1].index).toBe(1);
                expect(cols[2].header).toBe('JobTitle');
                expect(cols[2].index).toBe(2);
                wrapper.verifyData(wrapper.simpleGridData);
            });
        });
    }));

    it('should fire \'onColumnExport\' for each visible grid column.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        const cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        grid.columns[0].hidden = true;
        options.ignoreColumnsVisibility = false;

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    expect(cols.length).toBe(2);
                    expect(cols[0].header).toBe('Name');
                    expect(cols[0].index).toBe(0);
                    expect(cols[1].header).toBe('JobTitle');
                    expect(cols[1].index).toBe(1);
                    wrapper.verifyData(wrapper.gridNameJobTitle);
                });
            });

    }));

    it('should not export columns when \'onColumnExport\' is canceled.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        exporter.onColumnExport.subscribe((value: IColumnExportingEventArgs) => {
            value.cancel = true;
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyData('');
            });
        });
    }));

    it('should fire \'onRowExport\' for each grid row.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        const rows = [];
        exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then(() => {
                expect(rows.length).toBe(10);
                for (let i = 0; i < rows.length; i++) {
                    expect(rows[i].index).toBe(i);
                    expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
                }
            });
        });
    }));

    it('should not export rows when \'onRowExport\' is canceled.', async(() => {
        const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;

        exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
            value.cancel = true;
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyData('');
            });
        });
    }));

    // it("should honor 'exportCurrentlyVisiblePageOnly' option.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid;
    //     grid.paging = true;
    //     options.exportCurrentlyVisiblePageOnly = true;

    //     fix.whenStable().then(() => {
    //         fix.detectChanges();
    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Only page 1 should have been exported!");

    //             options.exportCurrentlyVisiblePageOnly = false;
    //             fix.detectChanges();
    //             getExportedData(grid, options).then((wrapper2) => {
    //                 wrapper2.verifyDataFilesContent(actualData.simpleGridDataFull, "All data should have been exported!");
    //             });
    //         });
    //     });
    // }));

    // it("should export currently visible grid page only.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid;
    //     fix.whenStable().then(() => {
    //         expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
    //         options.exportCurrentlyVisiblePageOnly = true;

    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyStructure();
    //             wrapper.verifyTemplateFilesContent();
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Page 1 should have been exported!");

    //             grid.paginate(1);
    //             grid.cdr.detectChanges();
    //             fix.whenStable().then(() => {
    //                 fix.detectChanges();
    //                 getExportedData(grid, options).then((wrapper2) => {
    //                     wrapper2.verifyDataFilesContent(actualData.simpleGridDataPage2, "Page 2 should have been exported!");
    //                 });
    //             });
    //         });
    //     });
    // }));

    // it("should honor the change of items per page.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid;
    //     fix.whenStable().then(() => {
    //         expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
    //         options.exportCurrentlyVisiblePageOnly = true;

    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Three rows should have been exported!");

    //             grid.perPage = 5;
    //             grid.cdr.detectChanges();
    //             fix.whenStable().then(() => {
    //                 fix.detectChanges();
    //                 expect(grid.rowList.length).toEqual(5, "Invalid number of rows initialized!");
    //                 getExportedData(grid, options).then((wrapper2) => {
    //                     wrapper2.verifyDataFilesContent(actualData.simpleGridDataPage1FiveRows, "5 rows should have been exported!");
    //                 });
    //             });
    //         });
    //     });
    // }));

    // it("should fire 'onRowExport' for each visible grid row.", async(() => {
    //     const fix = TestBed.createComponent(GridIDNameJobTitleComponent);
    //     fix.detectChanges();
    //     const grid = fix.componentInstance.grid;

    //     const rows = [];
    //     exporter.onRowExport.subscribe((value: RowExportingEventArgs) => {
    //         rows.push({ data: value.rowData, index: value.rowIndex });
    //     });

    //     grid.paging = true;
    //     grid.perPage = 3;

    //     fix.whenStable().then(() => {
    //         fix.detectChanges();
    //         getExportedData(grid, options).then(() => {
    //             expect(rows.length).toBe(3);
    //             for (let i = 0; i < rows.length; i++) {
    //                 expect(rows[i].index).toBe(i);
    //                 expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
    //             }
    //         });
    //     });
    // }));

    function getExportedData(grid, csvOptions: IgxCsvExporterOptions) {
        const result = new Promise<CSVWrapper>((resolve) => {
            exporter.onExportEnded.subscribe((value) => {
                const wrapper = new CSVWrapper(value.csvData, csvOptions.valueDelimiter);
                resolve(wrapper);
            });
            exporter.export(grid, csvOptions);
        });
        return result;
    }
});
