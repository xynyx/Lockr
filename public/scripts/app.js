$(() => {
  // Dynamically create membership table depending on organization clicked in dropdown menu
  $("#manageOrgs > a").on("click", function () {
    // Get org_id from data-id in html
    const org_id = $(this).data("id");
    $.ajax({
      url: "/manage/org",
      method: "POST",
      dataType: "JSON",
      data: { org_id },
      success: (data) => {
        const body = $("#manage-table").DataTable();
        body.clear();
        data.forEach((member) => {
          body.row
            .add([
              member.first_name,
              member.last_name,
              member.email,
              `<tr>
                <td>
                <button class="btn btn-info" type="button" id="make-admin">Make Admin</button>
                </td>
               </tr>`,
              `<tr>
                <button class="btn btn-danger" type="button" id="remove-member">Remove Member</button>
                </td>
              </tr>`,
            ])
            .draw(false);
        });
      },
    });
  });

  // Copy to clipboard function for modal
  $(".copy").on("click", function (event) {
    // Stop the copy button from submitting a PUT request
    event.preventDefault();
    // Remove disable to allow copy function
    const $passwordBox = $(event.target).parents().siblings(".passwordBox");
    $passwordBox.prop("disabled", false);
    $passwordBox.select();
    document.execCommand("copy");
    // Enable "disable" again
    $passwordBox.prop("disabled", true);
  });

  // Display value on slide for new password modal
  $(".password_length").on("input change", function () {
    $(".length_span").html($(".password_length").val());
  });

  // Display value on slide for edit password modal
  $(".passLength").on("input change", function (event) {
    $(event.target).siblings(".lengthSpan").html($(event.target).val());
  });

  $(".change").on("click", () => {
    const $passwordBox = $(event.target).parents().siblings(".passwordBox");
    $passwordBox.prop("disabled", false);

    // Slide down the generate password box
    $(event.target).parents().siblings(".change_generate").slideDown();
  });

  $(".close-modal").on("click", () => {
    const $passwordBox = $(event.target).parents().siblings(".passwordBox");
    $passwordBox.prop("disabled", true);
  });

  $("#title-filter").on("keyup", (event) => {
    const searchTerm = $("#title-filter").val();
    if (searchTerm) {
      // Hide every card first
      $(".pwd-card").addClass("hidden");

      // Show cards that match the search term
      // TODO
    } else {
      // Show every card if field is empty
      $(".pwd-card").removeClass("hidden");
    }
  });
});
