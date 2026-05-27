import * as z from 'zod'
import YAML from 'yaml'

export const Game = z.record(z.string(), z.unknown())
export type Game = z.infer<typeof Game>

export const Player = z
  .object({
    name: z.string(),
    description: z.string(),
    game: z.string(),
  })
  .catchall(z.unknown())
export type Player = z.infer<typeof Player>

export const PlayerForm = z.object({
  slot: z.string(),
  description: z.string(),
  game: z.string(),
  options: Game,
})
export type PlayerForm = z.infer<typeof PlayerForm>

export const formCodec = z.codec(Player, PlayerForm, {
  decode: player => ({
    slot: player.name,
    description: player.description,
    game: player.game,
    options: player[player.game] as Game,
  }),
  encode: form => ({
    name: form.slot,
    description: form.description,
    game: form.game,
    [form.game]: form.options,
  }),
})

// basically https://zod.dev/codecs#jsonschema but with yaml
const yamlCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (yamlString, ctx) => {
      try {
        return YAML.parse(yamlString)
      } catch (err: any) {
        ctx.issues.push({
          code: 'invalid_format',
          format: 'yaml',
          input: yamlString,
          message: err.message,
        })
        return z.NEVER
      }
    },
    encode: value => YAML.stringify(value),
  })

export const PlayerYaml = yamlCodec(formCodec)
