# Run: ruby _tests/math_delimiters_test.rb (requires installed Kramdown + GFM).
require 'minitest/autorun'
require 'kramdown'
require 'kramdown-parser-gfm'

# Capture native behavior before loading the site extension. In particular, code
# and native $$ math must produce identical HTML with and without the plugin.
UNCHANGED_MATH_FIXTURES = [
  '`$x_i$` and ``$x_`i$`` and `\\(x_i\\)`',
  "```python\nvalue = '$x_i$ and \\\\(y_j\\\\)'\n```\n",
  "~~~mermaid\nflowchart TD\nA[\"$x_i$\"] --> B[\"$$y_j$$\"]\n~~~\n",
  "    $indented_i$ and \\(literal\\)\n",
  "<code>$html_i$</code>\n\n<pre>$pre_i$</pre>\n",
  'ordinary **bold** and _emphasis_ and an_under_score',
  "intentional hard break  \nnext line\n",
  "- list hard break  \n  next line\n",
  'Price \\$5 vs \\$10; plain $5 and $10.',
  'Unmatched $x_i and a later `$literal_i$` code span.',
  'before $$x_i + y_j$$ after',
  "$$\nx_i + y_j\n$$\n",
  '[price](https://example.org/$path_i$) and <https://example.org/$path_i$>'
].freeze
NATIVE_MATH_HTML = UNCHANGED_MATH_FIXTURES.map do |source|
  Kramdown::Document.new(source, input: 'GFM').to_html
end.freeze

require_relative '../_plugins/math_delimiters'

class MathDelimitersTest < Minitest::Test
  FORMULA = '\\text{sat}_i = \\min\\left(\\frac{\\sum_{ds \\in \\text{item}_i} \\text{dataset\\_tested}[ds]}{\\text{total\\_tested}}, 1.0\\right)'.freeze

  def document(source)
    Kramdown::Document.new(source, input: 'GFM')
  end

  def math_nodes(element)
    (element.type == :math ? [element] : []) + element.children.flat_map { |child| math_nodes(child) }
  end

  def test_original_alpha18_formula_without_source_changes
    post = File.expand_path('../docs/_posts/2026-05-14-alpha18.md', __dir__)
    # Keep this parser regression runnable in a checkout without optional posts.
    # When the original article is available, also check its unchanged source.
    line = if File.file?(post)
             File.readlines(post).find { |text| text.include?('已回测的样本数占比') }
           else
             "已回测的样本数占比 $#{FORMULA}$。"
           end
    assert_includes line, "$#{FORMULA}$"
    refute_includes line, '<span'
    doc = document(line)
    assert_equal [FORMULA], math_nodes(doc.root).map(&:value)
    assert_equal :span, math_nodes(doc.root).first.options[:category]
    assert_includes doc.to_html, "\\(#{FORMULA}\\)"
    refute_includes doc.to_html, '<em>'
  end

  def test_native_code_markdown_currency_and_double_dollars_are_unchanged
    UNCHANGED_MATH_FIXTURES.zip(NATIVE_MATH_HTML).each do |source, expected|
      assert_equal expected, document(source).to_html, source
    end
  end

  def test_all_mathjax_delimiters_are_protected_from_markdown
    source = '$a_i * b$ and \\(c_j * d\\) and \\[e_k * f\\]'
    nodes = math_nodes(document(source).root)
    assert_equal ['a_i * b', 'c_j * d', 'e_k * f'], nodes.map(&:value)
    assert_equal [:span, :span, :block], nodes.map { |node| node.options[:category] }
    refute_includes document(source).to_html, '<em>'
  end

  def test_tex_escapes_and_html_comparisons_are_preserved_and_safe
    source = '$\\text{dataset\\_tested} + \\$5 < x_i & y_j$'
    doc = document(source)
    assert_equal ['\\text{dataset\\_tested} + \\$5 < x_i & y_j'], math_nodes(doc.root).map(&:value)
    assert_includes doc.to_html, '&lt; x_i &amp; y_j'
    assert_includes doc.to_html, '\\text{dataset\\_tested}'
  end

  def test_multiline_inline_math_is_one_node
    source = "$x_i +\ny_j$"
    assert_equal ["x_i +\ny_j"], math_nodes(document(source).root).map(&:value)
  end

  def test_math_inside_lists_links_and_emphasis
    source = "- **equation $x_i * y$** and [$z_j$](https://example.org/)\n"
    doc = document(source)
    assert_equal ['x_i * y', 'z_j'], math_nodes(doc.root).map(&:value)
    assert_includes doc.to_html, '<strong>equation \\(x_i * y\\)</strong>'
    assert_includes doc.to_html, '<a href="https://example.org/">\\(z_j\\)</a>'
  end

  def test_escaped_delimiters_do_not_open_math
    source = 'escaped \\$x_i\\$ and \\\\(not_math\\\\)'
    assert_empty math_nodes(document(source).root)
  end
end
