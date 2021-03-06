const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const dbHelpers = require("./helpers/db_helpers")(db);

  router.get("/", (req, res) => {
    if (!req.session.userId)
      return res.status(400).send("You must be logged in to continue.");
    let templateVars = {};
    dbHelpers
      .getUserWithId(req.session.userId)
      .catch((e) => e)
      .then((user) => {
        templateVars["user"] = user;
        return dbHelpers.getOrgsWithUserId(req.session.userId).catch((e) => e);
      })
      .then((orgs) => {
        templateVars["orgs"] = orgs;
        // If user has no orgs they're a part of of, redirect to "Create new org"
        if (!orgs) res.redirect("/orgs/new");
        // Only want to display orgs where they have admin rights on the manage page
        return dbHelpers
          .orgsWhereUserIsAdmin(req.session.userId)
          .catch((e) => e);
      })
      .then((adminOrgs) => {
        templateVars["adminOrgs"] = adminOrgs;
        if (adminOrgs.length === 0) {
          return res
            .status(400)
            .send(
              "You have no admin privileges in any organization that you belong to."
            );
        } else {
          res.render("manage", templateVars);
        }
      });
  });

  router.post("/orgs", (req, res) => {
    dbHelpers.getUsersByOrg(req.body.org_id).then((users) => {
      currentUser = req.session.userId;
      users.forEach((user) => {
        user["currentUser"] = currentUser;
      });
      res.json(users);
    });
  });
  //DELETE BASED ON email and org_id
  router.delete("/:org_id/:email", (req, res) => {
    const userId = req.session.userId;
    const orgId = req.params.org_id;
    const deleteUserEmail = req.params.email;
    //check if user is admin
    dbHelpers.isUserAdmin(orgId, userId).then((admin) => {
      if (!admin) {
        res.status(401).send("not authorized");
      }
      dbHelpers
        .removeUserFromOrg(orgId, deleteUserEmail)
        .then(() => {
          res.redirect("/manage");
        })
        .catch((e) => console.error(e));
    });
  });
  // UPDATE ADMIN
  router.put("/:org_id/:email", (req, res) => {
    const userId = req.session.userId;
    const orgId = req.params.org_id;
    const updateUserEmail = req.params.email;
    //check if user is admin
    dbHelpers.isUserAdmin(orgId, userId).then((admin) => {
      if (!admin) {
        res.status(401).send("not authorized");
      }
      dbHelpers
        .makeUserAdmin(orgId, updateUserEmail)
        .then(() => {
          res.redirect("/manage");
        })
        .catch((e) => console.error(e));
    });
  });
  // Add new member to org
  router.post("/orgs/:org_id", (req, res) => {
    const { newuser } = req.body;
    const { org_id } = req.params;
    const { userId } = req.session;
    let userExists;

    dbHelpers
      .isUserAdmin(org_id, userId)
      .then((admin) => {
        if (!admin)
          return res
            .status(403)
            .send("You are not authorized to add members to this organization.")
            .redirect("/");
        return dbHelpers.getUserWithEmail(newuser).catch((e) => e);
      })
      .then((userExistsScoped) => {
        if (!userExistsScoped) {
          return res.status(400).send("This user does not exist.");
        }

        userExists = userExistsScoped;
        return dbHelpers
          .isUserMemberOfOrg(userExists.id, org_id)
          .catch((e) => e);
      })
      .then((member) => {
        if (member)
          return res
            .status(418)
            .send("This user is already a member of this organization!");
        return dbHelpers.addUserToOrg(userExists.id, org_id).catch((e) => e);
      })
      .then((newUser) => {
        res.send(newUser);
      });
  });

  return router;
};
