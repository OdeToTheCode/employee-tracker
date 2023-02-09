const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'code1234',
  database: 'employee_tracker_db'
});

// Function to prompt the user for options
const promptUser = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      }
    ])
    .then(({ choice }) => {
      switch (choice) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
        default:
          console.log('Invalid option. Please try again.');
          promptUser();
      }
    });
};

// Function to view departments
const viewDepartments = () => {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) throw err;
    console.table(results);
    promptUser();
  });
};

// Function to view roles
const viewRoles = () => {
  connection.query(
    'SELECT roles.title, roles.salary, departments.name AS department FROM roles LEFT JOIN departments ON roles.department_id = departments.id',
    (err, results) => {
      if (err) throw err;
      console.table(results);
      promptUser();
    }
  );
};

// Function to view employees
const viewEmployees = () => {
  connection.query(
    'SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(managers.first_name, " ", managers.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees AS managers ON employees.manager_id = managers.id',
    (err, results) => {
      if (err) throw err;
      console.table(results);
      promptUser();
    }
  );
};

// Function to add a department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the department name:'
      }
    ])
    .then(({ name }) => {
      connection.query(
        'INSERT INTO departments (name) VALUES (?)',
        [name],
        (err) => {
          if (err) throw err;
          console.log(`Department "${name}" added.`);
          promptUser();
        }
      );
    });
};

// Function to add a role
const addRole = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the role salary:',
        validate: (input) => {
          const valid = !isNaN(parseFloat(input));
          return valid || 'Please enter a valid number';
        }
      },
      {
        type: 'input',
        name: 'department_id',
        message: 'Enter the department id:',
        validate: (input) => {
          const valid = !isNaN(parseInt(input));
          return valid || 'Please enter a valid number';
        }
      }
    ])
    .then(({ title, salary, department_id }) => {
      connection.query(
        'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
        [title, salary, department_id],
        (err) => {
          if (err) throw err;
          console.log(`Role "${title}" added.`);
          promptUser();
        }
      );
    });
};

// Function to add an employee
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'Enter the employee first name:'
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Enter the employee last name:'
      },
      {
        type: 'input',
        name: 'role_id',
        message: 'Enter the employee role id:',
        validate: (input) => {
          const valid = !isNaN(parseInt(input));
          return valid || 'Please enter a valid number';
        }
      },
      {
        type: 'input',
        name: 'manager_id',
        message: 'Enter the employee manager id (if applicable, otherwise leave blank):',
        validate: (input) => {
          const valid = !input || !isNaN(parseInt(input));
          return valid || 'Please enter a valid number';
        }
      }
    ])
    .then(({ first_name, last_name, role_id, manager_id }) => {
      connection.query(
        'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
        [first_name, last_name, role_id, manager_id || null],
        (err, res) => {
          if (err) throw err;
          console.log(`Employee "${first_name} ${last_name}" added.`);
          promptUser();
        }
      );
    });
};

// Function to update an employee role
const updateEmployeeRole = () => {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) throw err;
    const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee to update:',
          choices: employeeOptions
        },
        {
          type: 'input',
          name: 'role_id',
          message: 'Enter the new role id:',
          validate: (input) => {
            const valid = !isNaN(parseInt(input));
            return valid || 'Please enter a valid number';
          }
        }
      ])
      .then(({ employee_id, role_id }) => {
        connection.query(
          'UPDATE employees SET role_id = ? WHERE id = ?',
          [role_id, employee_id],
          (err) => {
            if (err) throw err;
            console.log('Employee role updated.');
            promptUser();
          }
        );
      });
  });
};

promptUser();
