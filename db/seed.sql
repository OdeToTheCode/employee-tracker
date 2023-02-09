USE employee_tracker_db;

INSERT INTO departments (name)
VALUES 
  ('Sales'),
  ('Marketing'),
  ('Technology');

INSERT INTO roles (title, salary, department_id)
VALUES
  ('Salesperson', 50000, 1),
  ('Marketing Manager', 75000, 2),
  ('Tech Lead', 100000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
  ('John', 'Doe', 1, null),
  ('Jane', 'Doe', 2, null),
  ('Jim', 'Smith', 3, 2);
