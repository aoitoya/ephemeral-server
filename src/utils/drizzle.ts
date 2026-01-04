import { Column, type GetColumnData, sql, SQL } from 'drizzle-orm'

type AnySql = boolean | Column | number | SQL | string
type Coalesce<T extends AnySql[]> = T extends [...infer Optionals, infer Last]
  ?
      | Exclude<ExtractSqlType<Optionals[number]>, null | undefined>
      | ExtractSqlType<Last>
  : never
type ExtractSqlType<S> =
  S extends SQL<infer T> ? T : S extends Column ? GetColumnData<S> : never

export function coalesce(...args: [AnySql, AnySql, ...AnySql[]]) {
  return sql<Coalesce<typeof args>>`coalesce(${sql.join(
    args.map((a) =>
      a instanceof Column || a instanceof SQL ? a : sql.param(a)
    ),
    sql.raw(',')
  )})`
}
