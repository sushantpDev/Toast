import Employee from '../models/Employee.js';
import Admin from '../models/Admin.js';

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
  const { name, email, department, role } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Please provide all required fields: name, email, department' });
  }

  try {
    // Check if email already exists in Employee or Admin collections
    const employeeExists = await Employee.findOne({ email });
    const adminExists = await Admin.findOne({ email });

    if (employeeExists || adminExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate temporary password (e.g., Toast@4815)
    const tempPassword = 'Toast@' + Math.floor(1000 + Math.random() * 9000);

    const employee = await Employee.create({
      name,
      email,
      department,
      role: role || 'employee',
      password: tempPassword, // Mongoose pre-save hook will hash this
      isFirstLogin: true,
      isActive: true,
    });

    res.status(201).json({
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        isFirstLogin: employee.isFirstLogin,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
      },
      tempPassword, // Return unhashed password so admin can give it to the employee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating employee' });
  }
};

// @desc    Get all employees with optional filters/search
// @route   GET /api/employees
// @access  Private (Admin only)
const getEmployees = async (req, res) => {
  try {
    const { search, department, isActive } = req.query;
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by active status
    if (isActive !== undefined && isActive !== 'All') {
      query.isActive = isActive === 'true';
    }

    const employees = await Employee.find(query).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving employees' });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
const updateEmployee = async (req, res) => {
  const { name, department, role } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.name = name || employee.name;
    employee.department = department || employee.department;
    employee.role = role || employee.role;

    const updatedEmployee = await employee.save();
    
    // Return updated employee without password
    const result = await Employee.findById(updatedEmployee._id).select('-password');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

// @desc    Toggle employee active/inactive status
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (Admin only)
const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({
      _id: employee._id,
      isActive: employee.isActive,
      message: `Employee is now ${employee.isActive ? 'Active' : 'Inactive'}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling employee status' });
  }
};

// @desc    Reset employee password by Admin
// @route   POST /api/employees/:id/reset-password
// @access  Private (Admin only)
const resetEmployeePassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Generate new temporary password
    const tempPassword = 'Toast@' + Math.floor(1000 + Math.random() * 9000);
    
    employee.password = tempPassword; // Will be hashed in pre-save
    employee.isFirstLogin = true; // Force change password again
    await employee.save();

    res.json({
      message: 'Password reset successful',
      tempPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error resetting employee password' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.deleteOne({ _id: req.params.id });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
};

export {
  createEmployee,
  getEmployees,
  updateEmployee,
  toggleEmployeeStatus,
  resetEmployeePassword,
  deleteEmployee,
};
