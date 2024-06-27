describe('Smoke Suite', () => {
    beforeEach(() => {
        /*URL */
        
        cy.wait(10000);
    });

    /* Check login DOM elements */
    it('should display login screen and login successfully', () => {
        cy.visit('https://smartoperation.siddhanproducts.com/#/login');
         cy.get('#cy_email').should('be.visible');
        cy.get('#cy_password').should('be.visible');
        cy.get('#cy_login').should('be.visible');

        /* Enter credentials and login */
        cy.get('#cy_email').type('francis@si.com');
        cy.get('#cy_password').type('Fran@123');
        cy.get('#cy_login').click();

        cy.wait(10000);
        cy.get('#cy_okay').click();

        /* Verify URL */
        cy.url().should('eq', 'https://smartoperation.siddhanproducts.com/#/layout/dashboard');

        /* login API request */
        cy.intercept('POST', '**/login', (req) => {
            req.continue((res) => {

                const profile = res?.body?.profile?.user
                expect(res.body).to.have.property('token');
                expect(profile).to.have.property('user_name')

            });
        }).as('loginRequest');
        /* check status code */
        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    });


    /* Checking dashboard DOM elements */
    it('Dashboard Screen', () => {
        cy.login();
        cy.get('.menu').should('be.visible').click();

        /*  GET dashboard API */
        cy.intercept('GET', '**/operation/tmt/delayTasks', (req) => {
            req.continue((res) => {

                
                const task = res.body?.data?.[0]
                const innerTasks = task?.taks?.[0]
                expect(task).to.have.property('_id').that.is.a('string');
                expect(task).to.have.property('arrivalFlight').that.is.a('string');
                expect(task).to.have.property('departureFlight').that.is.a('string');
                expect(innerTasks).to.have.property('taskname').that.is.a('string');
                expect(innerTasks).to.have.property('taskDelayMinutes').that.is.a('number');


            }); 
        }).as('getDashboardData');

        /* Navigate to the Department screen */
        cy.get('li:contains("Department")')
            .find('a')
            .should('be.visible').click();

        /* Verify URL change to department */
        cy.url().should('include', '/#/layout/masters/department');
        /* check status code */
        cy.wait('@getDashboardData').its('response.statusCode').should('eq', 200);


    });




    /* Check department DOM elements */
    it('Department Screen: DOM Elements', () => {

        cy.get('.menu').should('be.visible').click();
        cy.url().should('include', '/#/layout/masters/department');
        cy.get('.addEvent').should('be.visible');
        cy.get('[testing_id="cy_departmentcode"]').should('be.visible');
        cy.get('[testing_id="cy_departmentname"]').should('be.visible');
        cy.get('[testing_id="cy_label"]').should('be.visible');
        cy.get('[testing_id="cy_save"]').should('be.visible');
    });

    /* GET request departments API */
    it('Department Screen: API Interaction', () => {
        cy.intercept('GET', '**/master/department', (req) => {
            req.continue((res) => {

                expect(res.body.success).to.eq(true);
                expect(res.body.message).to.eq('Department Records fetched Successfully');
                expect(res.body.respayload).to.have.property('departments').that.is.an('array').and.not.empty;


                const firstDepartment = res.body.respayload?.departments?.[0];
                expect(firstDepartment).to.have.property('_id').that.is.a('string');
                expect(firstDepartment).to.have.property('department_code').that.is.a('string');
                expect(firstDepartment).to.have.property('department_name').that.is.a('string');


            });
        }).as('getDepartments');

        /* Visit the Department screen */
        cy.visit('https://smartoperation.siddhanproducts.com/#/layout/masters/department');

        /* verify status code */
        cy.wait('@getDepartments').its('response.statusCode').should('eq', 200);
    });
});