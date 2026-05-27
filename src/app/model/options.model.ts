import * as z from 'zod'

export enum Visibility {
  None = 0,
  Template = 1 << 0,
  SimpleUi = 1 << 1,
  ComplexUi = 1 << 2,
  Spoiler = 1 << 3,
  All = 0b1111,
}

// from https://github.com/colinhacks/zod/issues/2437#issuecomment-2408424929
function enumFlags<EnumObj extends Record<string, string | number>>(enumObj: EnumObj) {
  const enumValues = Object.values(enumObj).filter(
    (v): v is EnumObj[keyof EnumObj] & number => typeof v === 'number',
  )

  const allValidBits = enumValues.reduce((acc, val) => acc | val, 0)

  return z
    .number()
    .int()
    .refine((val): val is EnumObj[keyof EnumObj] & number => (val & ~allValidBits) === 0, {
      message: 'Invalid flags value',
    })
}

const OptionBase = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string(),
  randomizable: z.boolean(),
  visibility: enumFlags(Visibility),
})
export const Option = z.discriminatedUnion('type', [
  z.object({
    ...OptionBase.shape,
    type: z.literal('NamedRange'),
    default: z.union([z.literal('random'), z.int()]),
    min: z.int(),
    max: z.int(),
    presets: z.record(z.string(), z.int()),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('Range'),
    default: z.union([z.literal('random'), z.int()]),
    min: z.int(),
    max: z.int(),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('Toggle'),
    default: z.union([z.literal('random'), z.boolean()]),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('TextChoice'),
    default: z.union([z.literal('random'), z.string(), z.int()]),
    choices: z.array(
      z.object({
        name: z.string(),
        display_name: z.string(),
        value: z.union([z.string(), z.int()]),
      }),
    ),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('Choice'),
    default: z.union([z.literal('random'), z.int()]),
    choices: z.array(
      z.object({
        name: z.string(),
        display_name: z.string(),
        value: z.int(),
      }),
    ),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('FreeText'),
    default: z.union([z.literal('random'), z.string()]),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('OptionSet'),
    default: z.union([z.literal('random'), z.array(z.string())]),
    options: z.array(z.string()),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('OptionList'),
    default: z.union([z.literal('random'), z.array(z.string())]),
    options: z.array(z.string()),
  }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('OptionCounter'),
    default: z.union([z.literal('random'), z.record(z.string(), z.int())]),
    min: z.int().nullable(),
    max: z.int().nullable(),
    options: z.array(z.string()),
  }),
  // z.object({
  //   ...OptionBase.shape,
  //   type: z.literal('OptionDict'),
  // }),
  z.object({
    ...OptionBase.shape,
    type: z.literal('Unknown'),
    default: z.null().default(null),
  }),
])
export type Option = z.infer<typeof Option>

export const OptionGroup = z.object({
  name: z.string(),
  options: z.array(Option),
  collapsed: z.boolean(),
})
export type OptionGroup = z.infer<typeof OptionGroup>

export const World = z.object({
  name: z.string(),
  game: z.string(),
  version: z.string(), // TODO: semver?
  hidden: z.boolean(),
  groups: z.array(OptionGroup),
})
export type World = z.infer<typeof World>
