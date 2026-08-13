/**
 * Schema Validator — validates a JSON object against a schema file
 * (assets/schemas/input-schemas.json or output-schemas.json). Minimal,
 * dependency-free validator covering the subset this skill uses.
 *
 * Usage:
 *   npx tsx scripts/utils/schema-validator.ts <schemaFile> <toolName> <jsonFile>
 *   npx tsx scripts/utils/schema-validator.ts assets/schemas/input-schemas.json surveillance_detection sample.json
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: unknown[];
  additionalProperties?: boolean;
  minimum?: number;
  maximum?: number;
}

function validate(value: unknown, schema: Schema, path = '$'): string[] {
  const errors: string[] = [];
  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push(path + ': expected object');
      return errors;
    }
    const obj = value as Record<string, unknown>;
    if (schema.required) {
      for (const r of schema.required) {
        if (!(r in obj)) errors.push(path + '.' + r + ': missing required');
      }
    }
    if (schema.properties) {
      for (const [k, sub] of Object.entries(schema.properties)) {
        if (k in obj) errors.push(...validate(obj[k], sub, path + '.' + k));
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      for (const k of Object.keys(obj)) {
        if (!(k in schema.properties)) errors.push(path + '.' + k + ': additional property not allowed');
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(path + ': expected array');
      return errors;
    }
    if (schema.items) {
      value.forEach((v, i) => errors.push(...validate(v, schema.items as Schema, path + '[' + i + ']')));
    }
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') errors.push(path + ': expected string');
    if (schema.enum && !schema.enum.includes(value)) errors.push(path + ': not in enum ' + JSON.stringify(schema.enum));
  } else if (schema.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) errors.push(path + ': expected number');
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) errors.push(path + ': < minimum ' + schema.minimum);
      if (schema.maximum !== undefined && value > schema.maximum) errors.push(path + ': > maximum ' + schema.maximum);
    }
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') errors.push(path + ': expected boolean');
  }
  return errors;
}

const [,, schemaFile, toolName, jsonFile] = process.argv;
if (!schemaFile || !toolName || !jsonFile) {
  console.error('Usage: schema-validator.ts <schemaFile> <toolName> <jsonFile>');
  process.exit(2);
}

const schemaDoc = JSON.parse(readFileSync(resolve(schemaFile), 'utf8')) as { tools: Record<string, Schema> };
const toolSchema = schemaDoc.tools[toolName];
if (!toolSchema) {
  console.error('Tool "' + toolName + '" not found in ' + schemaFile);
  process.exit(2);
}
const value = JSON.parse(readFileSync(resolve(jsonFile), 'utf8'));
const errors = validate(value, toolSchema);
if (errors.length === 0) {
  console.log('VALID: ' + toolName + ' against ' + schemaFile);
  process.exit(0);
}
console.error('INVALID: ' + errors.length + ' error(s)');
for (const e of errors) console.error(' - ' + e);
process.exit(1);
