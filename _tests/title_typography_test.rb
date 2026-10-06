require 'jekyll'
require_relative '../_plugins/title_typography'

cases = {
  'Pi Desktop的开发难点: " 会话的状态 "' => 'Pi Desktop的开发难点: “会话的状态”',
  '标题: “ 会话的状态 “' => '标题: “会话的状态”',
  '标题: “ 会话的状态 ”' => '标题: “会话的状态”',
  '标题: ” 会话的状态 ”' => '标题: “会话的状态”',
  '“正确的引号”' => '“正确的引号”',
  '" first " 和 " second "' => '“first” 和 “second”',
  '"　中文空格　"' => '“中文空格”',
  '标题含 `echo " keep spaces "` 和 " 修正 "' => '标题含 `echo " keep spaces "` 和 “修正”',
  '标题含 ``echo " keep spaces "``' => '标题含 ``echo " keep spaces "``',
  "Don't change apostrophes" => "Don't change apostrophes",
  '5" monitor' => '5" monitor',
  '普通标题' => '普通标题',
  nil => nil,
  123 => 123
}

cases.each do |input, expected|
  actual = TitleTypography.normalize(input)
  raise "#{input.inspect}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
  raise "Not idempotent: #{input.inspect}" unless TitleTypography.normalize(actual) == actual
end

puts "PASS: #{cases.length} title cases, including code protection and idempotence."
