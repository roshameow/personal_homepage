# Normalize titles in memory before any templates, feeds or SEO tags render.
# Markdown sources and quotation marks inside inline code remain untouched.
module TitleTypography
  QUOTED_TEXT = /(`+)[^\r\n]*?\1|"([^"\r\n]*)"|[“”]([^“”\r\n]*)[“”]/.freeze

  def self.normalize(title)
    return title unless title.is_a?(String)

    title.gsub(QUOTED_TEXT) do |quoted|
      match = Regexp.last_match
      next quoted if match[1] # Preserve inline code, including its quotes.

      inner = (match[2] || match[3]).gsub(/\A[[:space:]]+|[[:space:]]+\z/, '')
      "“#{inner}”"
    end
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  (site.documents + site.pages).each do |item|
    item.data['title'] = TitleTypography.normalize(item.data['title']) if item.data.key?('title')
  end
end
