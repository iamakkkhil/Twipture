const express = require("express");
const router = express.Router();
const needle = require("needle");

const token = process.env.BEARER_TOKEN;
const app_pass = process.env.APP_PASS;
const endpointURL = "https://api.twitter.com/2/tweets?ids=";

async function getRequest(tweet_id) {
  const params = {
    ids: tweet_id,
    "tweet.fields": "created_at,attachments,public_metrics",
    expansions: "author_id",
    "user.fields": "profile_image_url",
  };

  const res = await needle("get", endpointURL, params, {
    headers: {
      "User-Agent": "v2TweetLookupJS",
      authorization: `Bearer ${token}`,
    },
  });

  if (res.body) {
    return res.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}

router.post("/", (req, res) => {
  const { pass, tweet_url } = req.body;
  // Validate request
  if (!pass || !tweet_url) {
    return res
      .status(422)
      .send({ success: false, error: "All field are required!" });
  }
  if (pass !== app_pass) {
    return res
      .status(403)
      .send({ success: false, error: "Unauthorised request" });
  }
  const tweet_url_array = tweet_url.split("/");

  if (tweet_url_array[2] !== "twitter.com") {
    return res
      .status(400)
      .json({ success: false, error: "Not a valid Twitter URL" });
  }
  const id = tweet_url_array.slice(-1);

  getRequest(id[0]).then((response) => {
    if ("errors" in response) {
      return res.send({ success: false, message: response["errors"] });
    }

    if ("includes" in response && "data" in response) {
      const user_data = response["includes"]["users"][0];
      const tweet_data = response["data"][0];

      const response_data = {
        username: user_data["username"],
        profile_image_url: user_data["profile_image_url"],
        name: user_data["name"],
        text: tweet_data["text"],
        created_at: tweet_data["created_at"],
        retweet_count: tweet_data["public_metrics"]["retweet_count"],
        reply_count: tweet_data["public_metrics"]["reply_count"],
        like_count: tweet_data["public_metrics"]["like_count"],
        quote_count: tweet_data["public_metrics"]["quote_count"],
      };

      return res.send({ success: true, message: response_data });
    }

    return res.send({ success: false, message: "Something went wrong" });
  });
});

module.exports = router;

// {
//     "data": [
//       {
//         "id": "1488926812734648320",
//         "author_id": "1348525846420602883",
//         "text": "CSS Fundamentals: Thinking inside the box\n{ by @BhaleraoAkhil } from @hashnode\n\n#css #frontenddevelopment #html5 #reactjs #webdevelopment https://t.co/x7fc73TKzr",
//         "created_at": "2022-02-02T17:26:29.000Z",
//         "public_metrics": {
//           "retweet_count": 1,
//           "reply_count": 2,
//           "like_count": 6,
//           "quote_count": 1
//         }
//       }
//     ],
//     "includes": {
//       "users": [
//         {
//           "name": "Akhil Bhalerao",
//           "id": "1348525846420602883",
//           "username": "BhaleraoAkhil",
//           "profile_image_url": "https://pbs.twimg.com/profile_images/1422368757909843969/rh7mE0RD_normal.jpg"
//         }
//       ]
//     }
//   }
