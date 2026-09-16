// DynamoDB テーブルの全件を別テーブルへコピーする（小さなテーブル向け。id で上書き）。
//   node scripts/copy-table.mjs <コピー元テーブル> <コピー先テーブル> [--dry-run]
// コピー元は Scan で読むだけ。コピー先へは BatchWriteItem（25 件ずつ）で書く。
import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb'

const [source, dest, flag] = process.argv.slice(2)
if (!source || !dest) {
  console.error('usage: node scripts/copy-table.mjs <source-table> <dest-table> [--dry-run]')
  process.exit(1)
}
const dryRun = flag === '--dry-run'
const client = new DynamoDBClient({})

const items = []
let ExclusiveStartKey
do {
  const page = await client.send(new ScanCommand({ TableName: source, ExclusiveStartKey }))
  items.push(...(page.Items ?? []))
  ExclusiveStartKey = page.LastEvaluatedKey
} while (ExclusiveStartKey)
console.log(`${source}: ${items.length} items`)

if (dryRun) {
  for (const it of items) console.log('  would write', it.id?.S)
  process.exit(0)
}
for (let i = 0; i < items.length; i += 25) {
  const chunk = items.slice(i, i + 25)
  let RequestItems = { [dest]: chunk.map((Item) => ({ PutRequest: { Item } })) }
  // 未処理分があれば再送
  for (let attempt = 0; attempt < 5 && Object.keys(RequestItems).length > 0; attempt++) {
    const res = await client.send(new BatchWriteItemCommand({ RequestItems }))
    RequestItems = res.UnprocessedItems ?? {}
    if (Object.keys(RequestItems).length > 0) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  if (Object.keys(RequestItems).length > 0) throw new Error('unprocessed items remain')
}
console.log(`${dest}: wrote ${items.length} items`)
