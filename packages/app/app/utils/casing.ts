/**
 * Title case a string.
 */
export function titleCase(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[_-]+/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim() // Trim leading and trailing spaces
    .toLowerCase() // Convert to lowercase
    .replace(/^\w|\s\w/g, match => match.toUpperCase()) // Capitalize the first letter of each word
}
