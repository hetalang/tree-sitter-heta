const PREC = {
  or: 1,
  and: 2,
  compare: 3,
  add: 4,
  multiply: 5,
  power: 6,
  unary: 7,
  call: 8,
};

module.exports = grammar({
  name: "heta",

  extras: $ => [
    /[\s\u00a0\u202f\u2000\u2001\u2003]+/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(choice(
      $.include_statement,
      $.namespace_block,
      $.block_statement,
      $.statement,
    )),

    include_statement: $ => seq(
      "include",
      field("source", choice($.quoted_string, $.file_path)),
      optional(seq("type", field("type", choice($.quoted_string, $.identifier)))),
      optional(seq("with", field("parameters", $.metadata))),
      optional(";"),
    ),

    namespace_block: $ => seq(
      optional(field("kind", choice("abstract", "concrete"))),
      "namespace",
      optional(field("name", $.identifier)),
      "begin",
      repeat(choice(
        $.include_statement,
        $.block_statement,
        $.statement,
      )),
      "end",
    ),

    block_statement: $ => seq(
      "block",
      repeat(choice(
        $.note,
        $.index,
        $.action,
        $.class,
        $.title,
        $.metadata,
        $.assignment,
      )),
      "begin",
      repeat(choice(
        $.include_statement,
        $.block_statement,
        $.statement,
      )),
      "end",
    ),

    statement: $ => seq(
      repeat1(choice(
        $.note,
        $.index,
        $.action,
        $.class,
        $.title,
        $.metadata,
        $.assignment,
      )),
      ";",
    ),

    index: $ => choice(
      $.qualified_identifier,
      $.identifier,
      $.wildcard,
    ),

    qualified_identifier: $ => seq(
      field("space", $.identifier),
      "::",
      field("name", choice($.identifier, $.wildcard)),
    ),

    wildcard: _ => "*",

    class: $ => seq(
      "@",
      field("name", $.identifier),
    ),

    action: $ => seq(
      "#",
      field("name", $.identifier),
    ),

    title: _ => token(seq(
      "'",
      repeat(choice(/[^'\\]/, /\\./)),
      "'",
    )),

    note: _ => token(seq(
      "'''",
      repeat(choice(/[^'\\]/, /\\./, /'{1,2}[^']/)),
      "'''",
    )),

    metadata: $ => seq(
      "{",
      optional(seq(
        $.pair,
        repeat(seq(optional(","), $.pair)),
        optional(","),
      )),
      "}",
    ),

    pair: $ => seq(
      field("key", $.identifier),
      ":",
      field("value", $.metadata_value),
    ),

    metadata_value: $ => choice(
      $.metadata,
      $.array,
      $.process_expression,
      $.quoted_string,
      $.title,
      $.number,
      $.boolean,
      $.null,
      $.unit_fragment,
      $.identifier,
      $.metadata_raw,
    ),

    array: $ => seq(
      "[",
      optional(seq(
        $.metadata_value,
        repeat(seq(",", $.metadata_value)),
        optional(","),
      )),
      "]",
    ),

    process_expression: $ => prec.right(seq(
      optional($.actor_side),
      $.process_arrow,
      optional($.actor_side),
    )),

    actor_side: $ => seq(
      $.actor_factor,
      repeat(seq(choice("+", "-"), $.actor_factor)),
    ),

    actor_factor: $ => choice(
      $.identifier,
      $.qualified_identifier,
      seq($.number, "*", choice($.identifier, $.qualified_identifier)),
      seq("(", $.actor_side, ")"),
    ),

    process_arrow: _ => choice("=>", "<=>"),

    assignment: $ => seq(
      field("operator", $.assignment_operator),
      field("value", choice(
        $.quoted_string,
        $.math_expression,
      )),
    ),

    assignment_operator: $ => choice(
      "=",
      ":=",
      ".=",
      "`=",
      $.switch_assignment_operator,
    ),

    switch_assignment_operator: $ => seq(
      "[",
      optional(field("switch", $.identifier)),
      "]=",
    ),

    math_expression: $ => choice(
      $.number,
      $.boolean,
      $.null,
      $.identifier,
      $.qualified_identifier,
      $.call_expression,
      $.parenthesized_expression,
      $.unary_expression,
      $.binary_expression,
    ),

    parenthesized_expression: $ => seq(
      "(",
      $.math_expression,
      ")",
    ),

    call_expression: $ => prec(PREC.call, seq(
      field("function", $.identifier),
      "(",
      optional($.argument_list),
      ")",
    )),

    argument_list: $ => seq(
      $.math_expression,
      repeat(seq(",", $.math_expression)),
      optional(","),
    ),

    unary_expression: $ => prec(PREC.unary, seq(
      field("operator", choice("+", "-", "!")),
      field("argument", $.math_expression),
    )),

    binary_expression: $ => choice(
      prec.left(PREC.or, seq(
        field("left", $.math_expression),
        field("operator", choice("or", "||")),
        field("right", $.math_expression),
      )),
      prec.left(PREC.and, seq(
        field("left", $.math_expression),
        field("operator", choice("and", "&&")),
        field("right", $.math_expression),
      )),
      prec.left(PREC.compare, seq(
        field("left", $.math_expression),
        field("operator", choice("==", "!=", "<=", ">=", "<", ">")),
        field("right", $.math_expression),
      )),
      prec.left(PREC.add, seq(
        field("left", $.math_expression),
        field("operator", choice("+", "-")),
        field("right", $.math_expression),
      )),
      prec.left(PREC.multiply, seq(
        field("left", $.math_expression),
        field("operator", choice("*", "/", "%")),
        field("right", $.math_expression),
      )),
      prec.right(PREC.power, seq(
        field("left", $.math_expression),
        field("operator", "^"),
        field("right", $.math_expression),
      )),
    ),

    quoted_string: _ => token(seq(
      '"',
      repeat(choice(/[^"\\]/, /\\./)),
      '"',
    )),

    boolean: _ => choice("true", "false"),

    null: _ => "null",

    number: _ => /[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?/,

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    file_path: _ => token(/[A-Za-z0-9._/\\-]+/),

    unit_fragment: _ => token(prec(2, /(?:[A-Za-z%][A-Za-z0-9_%]*|\d+)(?:[/*](?:[A-Za-z%][A-Za-z0-9_%]*|\d+))*/)),

    metadata_raw: _ => token(prec(-1, /[^,\]}]+/)),

    comment: _ => token(choice(
      seq("//", /[^\r\n]*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
    )),
  },
});
