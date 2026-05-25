/** Validation utilities for user registration and login */

/** Username: 3‑20 alphanumeric characters (underscores allowed) */
export const validateUsername = (username: string): boolean => {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

/** Password: minimum 8 characters, at least one number and one special character */
export const validatePassword = (password: string): boolean => {
  const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
  return re.test(password);
};

/** Basic e‑mail format validation */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/** Domain whitelist – edit the array to restrict allowed domains.
 *  Empty array permits any domain.
 */
const ALLOWED_DOMAINS: string[] = ["castletroycollege.ie"];

export const validateEmailDomain = (email: string): boolean => {
  if (ALLOWED_DOMAINS.length === 0) return true;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return ALLOWED_DOMAINS.includes(domain);
};

/** Full registration payload validation – returns an error string or null */
export const validateRegistration = (
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null => {
  if (!validateUsername(username))
    return "Username must be 3‑20 alphanumeric characters.";
  if (!validateEmail(email)) return "Invalid e‑mail address.";
  if (!validateEmailDomain(email)) return "Please use your school email for registration.";
  if (!validatePassword(password))
    return "Password must be ≥8 chars, include a number and a special character.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
};
