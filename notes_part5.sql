INSERT INTO user_profiles(age, city, url, user_id)
VALUES ($1,$2, $3, $4);

UPDATE user_profiles SET age = $1, city =$2, url = $3 WHERE user_id = $4;

-- IF  there is a conflict with the user id, offer an alternative
INSERT INTO user_profiles (age, city, url, user_id)
VALUES ($1,$2, $3, $4)
ON CONFLICT (user_profiles.user_id)
DO UPDATE user_profiles SET age = $1, city =$2, url = $3;

DELETE FROM users WHERE id = $1;

<form method="POST" action="/sig/delete">
  <input type="hidden"  name="csrf" value="{{csrf}}">
  <button>delete</button>
</form>


-- app.get("/logout"...) {
--   req.session = null;
--   res.redirect("/login")
-- }
