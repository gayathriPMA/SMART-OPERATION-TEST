describe('Regression Suite', () => {
    beforeEach(() => {
        cy.wait(5000);
    });

    /* Logout */
    afterEach(() => {
        cy.logout();
    });

    /* check redirect URL*/
    it('Login with valid email & password', () => {
        cy.login();
        cy.url().should('eq', 'https://smartoperation.siddhanproducts.com/#/layout/dashboard');
    });

    /* login with invalid password */
    it('Login with invalid password', () => {
        cy.visit('https://smartoperation.siddhanproducts.com/#/login');
        cy.get('#cy_email').type('francis@si.com');
        cy.get('#cy_password').type('fran123');
        cy.get('#cy_login').click();
        cy.get('.mat-snack-bar-container').contains('Authentication Failed').should('be.visible'); 
    });

    /*view department screen */
    it('Check Department screen', () => {
        cy.login();
        cy.navigateToDepartmentScreen();
    });

    /* Create a new department */
    it('Create Department from departments.json', () => {
        cy.login();
        
        cy.fixture('departments.json').then((departments) => {
            const newDepartment = departments.department11;
            cy.navigateToDepartmentScreen();

            cy.get('.addEvent').click();
            cy.wait(10000);
            cy.get('#mat-input-3').type(newDepartment.name);
            cy.wait(10000);
            cy.get('[testing_id="cy_label"]').type(newDepartment.label);
            cy.wait(10000);
            cy.get('[testing_id="cy_save"]').click();
            cy.wait(5000);

            /* search department */
            searchDepartment(newDepartment.name);
            cy.wait(10000);
        });
    });

    it('Edit Created Department', () => {
        cy.login();
        const newLabel = 'Updated Label';
        cy.navigateToDepartmentScreen();

        /* search and edit a department */
        searchAndEditDepartment('Test Department 11', newLabel);
    });

    it('Delete Created Department', () => {
        cy.login();
        cy.navigateToDepartmentScreen();
        /* search and delete a department */
        searchAndDeleteDepartmentByLabel('Label 11');
    });
});

/* search department with pagination */
function searchDepartment(departmentName) {
    const searchInCurrentPage = () => {
        let found = false;
        cy.get('table.mat-table tbody tr').each(($row) => {
            cy.wrap($row).find('td').first().then(($cell) => {
                if ($cell.text().trim() === departmentName) {
                    cy.wrap($row).should('contain.text', departmentName);
                    cy.log(`Department '${departmentName}' found`);
                    found = true;
                    return false; 
                }
            });
        }).then(($rows) => {
            if (!found && $rows.length > 0) {
                goToNextPage();
            } else if (!found) {
                cy.log(`Department '${departmentName}' not found`);
            }
        });
    };

    const goToNextPage = () => {
        cy.get('.mat-paginator-navigation-next').should('be.visible').then($nextButton => {
            if ($nextButton.hasClass('mat-button-disabled')) {
                cy.log(`Department '${departmentName}' not found`);
            } else {
                cy.wrap($nextButton).click();

                cy.wait(1000);
                searchDepartment(departmentName);
            }
        });
    };

    searchInCurrentPage();
}

/* search and edit a department */
function searchAndEditDepartment(departmentName, newLabel) {
    const searchInCurrentPage = () => {
        let found = false;
        cy.get('table.mat-table tbody tr').each(($row) => {
            cy.wrap($row).find('td').first().then(($cell) => {
                if ($cell.text().trim() === departmentName) {
                    cy.wrap($row).should('contain.text', departmentName);
                    cy.log(`Department '${departmentName}' found`);
                    cy.wrap($row).find('button[testing_id="cy_aiwketjvm"]').click();
                    cy.get('[testing_id="cy_label"]').clear().type(newLabel);
                    cy.get('[testing_id="cy_save"]').click();
                    found = true;
                    return false;
                }
            });
        }).then(($rows) => {
            if (!found && $rows.length > 0) {
                goToNextPage();
            } else if (!found) {
                cy.log(`Department '${departmentName}' not found`);
            }
        });
    };

    const goToNextPage = () => {
        cy.get('.mat-paginator-navigation-next').should('be.visible').then($nextButton => {
            if ($nextButton.hasClass('mat-button-disabled')) {
                cy.log(`Department '${departmentName}' not found`);
            } else {
                cy.wrap($nextButton).click();
                cy.wait(1000);
                searchAndEditDepartment(departmentName, newLabel);
            }
        });
    };

    searchInCurrentPage();
}

/* search and delete a department by label */
function searchAndDeleteDepartmentByLabel(label) {
    const searchInCurrentPage = () => {
        let found = false;
        cy.get('table.mat-table tbody tr').each(($row) => {
            cy.wrap($row).find('td.mat-column-label').then(($cell) => {
                if ($cell.text().trim() === label) {
                    cy.wrap($row).should('contain.text', label);
                    cy.log(`Department with label '${label}' found`);
                    cy.wrap($row).find('button.mat-warn').click();
                    cy.contains(label).should('not.exist');
                    found = true;
                    return false;
                }
            });
        }).then(($rows) => {
            if (!found && $rows.length > 0) {
                goToNextPage();
            } else if (!found) {
                cy.log(`Department with label '${label}' not found`);
            }
        });
    };

    const goToNextPage = () => {
        cy.get('.mat-paginator-navigation-next').should('be.visible').then($nextButton => {
            if ($nextButton.hasClass('mat-button-disabled')) {
                cy.log(`Department with label '${label}' not found`);
            } else {
                cy.wrap($nextButton).click();
                cy.wait(1000);
                searchAndDeleteDepartmentByLabel(label);
            }
        });
    };

    searchInCurrentPage();
}
