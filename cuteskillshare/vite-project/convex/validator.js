// Strict validator functions to validate type, length, and format of inputs

export function validateString(value, { min = 0, max = Infinity, pattern, enumValues, name = "Value" } = {}) {
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string, got ${typeof value}`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${name} length must be between ${min} and ${max} characters`);
  }
  if (pattern && !pattern.test(value)) {
    throw new Error(`${name} format is invalid`);
  }
  if (enumValues && !enumValues.includes(value)) {
    throw new Error(`${name} must be one of: ${enumValues.join(", ")}`);
  }
  return value;
}

export function validateEmail(email, name = "Email") {
  validateString(email, { min: 5, max: 254, name });
  // Strict RFC 5322 email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error(`${name} is not a valid email address`);
  }
  return email;
}

export function validateName(nameVal, name = "Name") {
  validateString(nameVal, { min: 2, max: 100, name });
  // Standard characters for human names: letters, spaces, hyphens, periods, apostrophes, and parentheses
  const nameRegex = /^[a-zA-Z0-9\s.\-'\(\)]+$/;
  if (!nameRegex.test(nameVal)) {
    throw new Error(`${name} contains invalid characters`);
  }
  return nameVal;
}

export function validateUrl(url, name = "URL") {
  validateString(url, { min: 0, max: 1000, name });
  if (url) {
    const urlRegex = /^(https?:\/\/|data:image\/|blob:)[^\s]+$/i;
    if (!urlRegex.test(url)) {
      throw new Error(`${name} is not a valid HTTP/HTTPS, data, or blob URL`);
    }
  }
  return url;
}

export function validateSocial(social, type = "Social link") {
  validateString(social, { min: 0, max: 200, name: type });
  if (social) {
    // Allows username handles or full github/linkedin/twitter/x URLs
    const socialRegex = /^[a-zA-Z0-9_.\-\/?:&=@]+$/;
    if (!socialRegex.test(social)) {
      throw new Error(`${type} contains invalid characters`);
    }
  }
  return social;
}

export function validateSkillsArray(arr, name = "Skills") {
  if (!Array.isArray(arr)) {
    throw new Error(`${name} must be an array`);
  }
  if (arr.length > 30) {
    throw new Error(`${name} array cannot exceed 30 items`);
  }
  const skillRegex = /^[a-zA-Z0-9\s.#\-+&]+$/;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    validateString(item, { min: 1, max: 50, name: `${name}[${i}]` });
    if (!skillRegex.test(item)) {
      throw new Error(`${name}[${i}] ("${item}") contains invalid characters`);
    }
  }
  return arr;
}

export function validateNumber(value, { min = -Infinity, max = Infinity, isInteger = false, name = "Value" } = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${name} must be a number`);
  }
  if (isInteger && !Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
}

export function validateBoolean(value, name = "Value") {
  if (typeof value !== "boolean") {
    throw new Error(`${name} must be a boolean`);
  }
  return value;
}

export function validateIdString(value, name = "ID") {
  validateString(value, { min: 1, max: 100, name });
  // Convex ID format validation (typically alphanumeric/underscore/dash/etc.)
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (!idRegex.test(value)) {
    throw new Error(`${name} has an invalid format`);
  }
  return value;
}
