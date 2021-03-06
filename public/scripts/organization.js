// Client-side javascript loaded into only organization.ejs

/**
 * Adds attribute timespwned=number to each .passWordBox <input> using
 * haveibeenpwned API upon opening a modal. Also updates the corresponding
 * pwd-card to add a class indicating level of pwnage.
 * @param {String} password The password to check
 * @return {Number} How many times pwned according to API
 */
const addPwnedAttributeToPasswordBox = function ($passwordBox) {
  const password = $passwordBox.val();
  const hashedPassword = sha1(password).toUpperCase();
  const firstFiveHash = hashedPassword.slice(0, 5);
  const remainingHash = hashedPassword.slice(5, hashedPassword.length);
  $.ajax({
    url: `https://api.pwnedpasswords.com/range/${firstFiveHash}`,
    method: "GET",
    success: (data) => {
      // data is one string with remainingHash:noOfTimes on each line
      const rows = data.split(/\n|:/);
      const indexOfPassword = rows.indexOf(remainingHash);

      // Change timespwned attribute on the input class
      if (indexOfPassword === -1) {
        $passwordBox.attr("timespwned", 0);
        addPwnageLvlClass($passwordBox); // Adds pwd-card class
        return 0;
      } else {
        const timesPwned = rows[indexOfPassword + 1];
        $passwordBox.attr("timespwned", timesPwned);
        addPwnageLvlClass($passwordBox); // Adds pwd-card class
        return timesPwned;
      }
    },
    error: (e) => {
      console.log(e);
    },
  });
};

// Change the class of the pwd card according to the timespwned attribute
// of passwordBox in its modal, using jQuery tree traversal
const addPwnageLvlClass = function ($passwordBox) {
  // Use the modal_id to get the card_id
  $modal = $passwordBox.closest(".modal");
  const id = $modal.attr("id").split("_")[1];
  $card = $(`#card_${id}`);

  // Removes existing classes first
  $modal
    .find(".modal-content")
    .removeClass("pwned-major pwned-moderate pwned-minor");
  $card.removeClass("pwned-major pwned-moderate pwned-minor");

  // Add classes according to the timespwned value
  const timesPwned = Number($passwordBox.attr("timespwned"));
  const majorThreshold = 100000;
  const moderateThreshold = 1000;
  const minorThreshold = 3;
  if (timesPwned > majorThreshold) {
    $modal.find(".modal-content").addClass("pwned-major");
    $card.addClass("pwned-major");
  } else if (timesPwned > moderateThreshold) {
    $modal.find(".modal-content").addClass("pwned-moderate");
    $card.addClass("pwned-moderate");
  } else if (timesPwned > minorThreshold) {
    $modal.find(".modal-content").addClass("pwned-minor");
    $card.addClass("pwned-minor");
  }
};

$(() => {
  // Add timespwned='number' to all .passwordBox <inputs> upon page load
  $(".passwordBox").each(function () {
    addPwnedAttributeToPasswordBox($(this));
  });

  // Test code for changing of attribute when change password button is clicked
  $(".change").on("click", function () {
    const $passwordBox = $(event.target).parents().siblings(".passwordBox");
    addPwnedAttributeToPasswordBox($passwordBox);
  });

  // Changes timespwned as passwordBox is being modified
  $(".passwordBox").on("keyup", function () {
    addPwnedAttributeToPasswordBox($(this));
  });

  // Change the new password modal box upon entering password
  $("#new_pwd_input").on("keyup", function () {
    addPwnedAttributeToPasswordBox($(this));
  });
});
