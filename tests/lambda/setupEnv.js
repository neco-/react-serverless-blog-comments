// Lambda handler はモジュール読み込み時にテーブル名を読むので、handler の import より前にセットする
process.env.API_BLOGCOMMENTS_COMMENTTABLE_NAME = 'Comment-test'
process.env.API_BLOGCOMMENTS_VOTESTABLE_NAME = 'Votes-test'
