import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'toast_secret_key_2026', {
    expiresIn: '30d',
  });
};

export default generateToken;
