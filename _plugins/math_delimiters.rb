# frozen_string_literal: true

require 'kramdown'
require 'kramdown-parser-gfm'

# Obsidian uses $...$ for inline math; Kramdown only recognizes $$...$$.
# Parse the additional MathJax delimiters as native math nodes BEFORE Markdown
# can interpret TeX underscores, backslashes, asterisks or HTML comparisons.
# Native block/fenced/indented code and codespan parsers retain ownership of code.
module SiteMathDelimiters
  # Avoid treating currency ($5 and $10), empty dollars, or a dollar inside a
  # later code span as a closing delimiter. Escaped dollars remain part of TeX.
  DOLLAR = /\$(?![\s$])(?:\\.|[^\\$`])*?(?<!\s)\$(?![\d$])/m.freeze
  PAREN = /\\\((?:\\.|[^\\])*?\\\)/m.freeze
  BRACKET = /\\\[(?:\\.|[^\\])*?\\\]/m.freeze
  START = Regexp.union(DOLLAR, PAREN, BRACKET).freeze

  def initialize(source, options)
    super
    # Preserve Kramdown's native $$ inline/block behavior. Only add the missing
    # delimiters; at a backslash this parser must precede escaped_chars_gfm.
    @span_parsers.insert(@span_parsers.index(:inline_math) + 1, :site_math)
  end

  def parse_site_math
    raw = @src.matched
    line = @src.current_line_number
    @src.pos += @src.matched_size
    value = raw.start_with?('$') ? raw[1...-1] : raw[2...-2]
    category = raw.start_with?('\\[') ? :block : :span
    @tree.children << ::Kramdown::Element.new(:math, value, nil,
                                             category: category, location: line)
  end
end

Kramdown::Parser::GFM.define_parser(:site_math, SiteMathDelimiters::START, '\\$|\\\\')
Kramdown::Parser::GFM.prepend(SiteMathDelimiters)
