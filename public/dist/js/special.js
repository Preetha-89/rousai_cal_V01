/* --- Input to blank when the current val is zero ----- */
$("input[type=number]").bind("focus keyup", function () {
    if ($(this).val() == "0") $(this).val("");
});
/* --- Input to zero when the current val is blank ----- */
$("input[type=number]").on("keydown change focusout", function () {
    if ($(this).val().trim() == "") $(this).val("0");
});

