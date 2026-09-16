// Gen2 のスキーマ定義から生成される GraphQL SDL を出力する（デプロイせずに API の形を確認するため）
//   npx tsx scripts/print-schema.ts
import { schemaSdl } from '../amplify/data/resource'

console.log(schemaSdl())
