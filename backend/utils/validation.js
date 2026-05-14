const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isEmail(value) {
  return isNonEmptyString(value) && EMAIL_RE.test(value.trim());
}

function validateRegisterInput(body) {
  const errors = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = typeof body.role === 'string' ? body.role : '';
  const organizationName = typeof body.organizationName === 'string' ? body.organizationName.trim() : '';
  const skills = Array.isArray(body.skills) ? body.skills.filter((s) => typeof s === 'string' && s.trim()) : [];

  if (!isNonEmptyString(name)) errors.name = 'Name is required.';
  if (!isEmail(email)) errors.email = 'A valid email is required.';
  if (!isNonEmptyString(password)) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';

  if (!['ngo', 'partner', 'admin'].includes(role)) {
    errors.role = 'Role must be one of: ngo, partner, admin.';
  }

  if (role === 'ngo' && !isNonEmptyString(organizationName)) {
    errors.organizationName = 'Organization name is required for NGOs.';
  }

  if (role === 'partner' && skills.length === 0) {
    errors.skills = 'At least one skill is required for Tech Partners.';
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { name, email, password, role, organizationName, skills }
  };
}

function validateLoginInput(body) {
  const errors = {};

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isEmail(email)) errors.email = 'A valid email is required.';
  if (!isNonEmptyString(password)) errors.password = 'Password is required.';

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { email, password }
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
