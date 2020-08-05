const request = require('request');
const WebSocket = require('ws');
require('dotenv').config();


const config = [
  { auth: process.env.LEMMY_JWT1, username: process.env.LEMMY_USERNAME1, userId: process.env.LEMMY_USERID1 },
  { auth: process.env.LEMMY_JWT2, username: process.env.LEMMY_USERNAME2, userId: process.env.LEMMY_USERID2 },
  { auth: process.env.LEMMY_JWT3, username: process.env.LEMMY_USERNAME3, userId: process.env.LEMMY_USERID3 },
  { auth: process.env.LEMMY_JWT4, username: process.env.LEMMY_USERNAME4, userId: process.env.LEMMY_USERID4 },
  { auth: process.env.LEMMY_JWT5, username: process.env.LEMMY_USERNAME5, userId: process.env.LEMMY_USERID5 },
  { auth: process.env.LEMMY_JWT6, username: process.env.LEMMY_USERNAME6, userId: process.env.LEMMY_USERID6 },
  { auth: process.env.LEMMY_JWT7, username: process.env.LEMMY_USERNAME7, userId: process.env.LEMMY_USERID7 },
  { auth: process.env.LEMMY_JWT9, username: process.env.LEMMY_USERNAME9, userId: process.env.LEMMY_USERID8 }
  //{ auth: process.env.LEMMY_JWT10, username: process.env.LEMMY_USERNAME10, userId: process.env.LEMMY_USERID10 },
  //{ auth: process.env.LEMMY_JWT11, username: process.env.LEMMY_USERNAME11, userId: process.env.LEMMY_USERID11 },
  //{ auth: process.env.LEMMY_JWT12, username: process.env.LEMMY_USERNAME12, userId: process.env.LEMMY_USERID12 },
  //{ auth: process.env.LEMMY_JWT13, username: process.env.LEMMY_USERNAME13, userId: process.env.LEMMY_USERID13 },
  //{ auth: process.env.LEMMY_JWT14, username: process.env.LEMMY_USERNAME14, userId: process.env.LEMMY_USERID14 },
  //{ auth: process.env.LEMMY_JWT15, username: process.env.LEMMY_USERNAME15, userId: process.env.LEMMY_USERID15 },
  //{ auth: process.env.LEMMY_JWT16, username: process.env.LEMMY_USERNAME16, userId: process.env.LEMMY_USERID16 },
  //{ auth: process.env.LEMMY_JWT17, username: process.env.LEMMY_USERNAME17, userId: process.env.LEMMY_USERID17 },
  //{ auth: process.env.LEMMY_JWT18, username: process.env.LEMMY_USERNAME18, userId: process.env.LEMMY_USERID18 },
  //{ auth: process.env.LEMMY_JWT19, username: process.env.LEMMY_USERNAME19, userId: process.env.LEMMY_USERID19 },
  //{ auth: process.env.LEMMY_JWT20, username: process.env.LEMMY_USERNAME20, userId: process.env.LEMMY_USERID20 },
  //{ auth: process.env.LEMMY_JWT21, username: process.env.LEMMY_USERNAME21, userId: process.env.LEMMY_USERID21 },
  //{ auth: process.env.LEMMY_JWT22, username: process.env.LEMMY_USERNAME22, userId: process.env.LEMMY_USERID22 },
  //{ auth: process.env.LEMMY_JWT23, username: process.env.LEMMY_USERNAME23, userId: process.env.LEMMY_USERID23 },
  //{ auth: process.env.LEMMY_JWT24, username: process.env.LEMMY_USERNAME24, userId: process.env.LEMMY_USERID24 },
  //{ auth: process.env.LEMMY_JWT25, username: process.env.LEMMY_USERNAME25, userId: process.env.LEMMY_USERID25 },
  //{ auth: process.env.LEMMY_JWT26, username: process.env.LEMMY_USERNAME26, userId: process.env.LEMMY_USERID26 }
];

const POST_CACHE_LENGTH = 250;
const postCache = [];
const postCacheIndex = {};
const postCachePush = (postId) => {
  if (postCacheGet(postId)) {
    // Skip posts that are already cached
    return;
  }
  if (postCache.length >= POST_CACHE_LENGTH) {
    // must remove oldest entry
    const oldPostId = postCache.shift();
    delete postCacheIndex[oldPostId];
  }
  postCache.push(postId);
  postCacheIndex[postId] = true;
};
const postCacheGet = (postId) => {
  return postCacheIndex[postId];
}

const getPosts = () => {
  keywords = ['Kerry', 'wreckers', 'brigade', 'brigadier', 'spammer', 'spam', 'alts', 'kerrypost', 'hairy', 'kerry post']
  keywords.map(key => {
    console.log(`Search Posts: '${key}'\n`);
    ws.send(JSON.stringify({
      op: 'Search',
      data: {
        limit: 20,
        page: 1,
        q: key,
        sort: "New",
        type_: "Posts"
      }
    }));
  })
};

const likePost = (postId) => {
  console.log('Liking Post');
  config.map(user => {
    ws.send(JSON.stringify({
      op: 'CreatePostLike',
      data: {
        post_id: postId,
        score: 1,
        auth: user.auth
      }
    }));
  })
};

const savePost = (postId) => {
  console.log('Saving Post');
  ws.send(JSON.stringify({
    op: 'SavePost',
    data: {
      post_id: postId,
      save: true,
      auth: config.auth
    }
  }));
};


const handlePosts = (data) => {
  //console.log(data)
  data.posts.map((post) => {
    if (!postCacheGet(post.id)) {
      postCachePush(post.id);
      likePost(post.id);
      console.log(`${post.id}\t|\t${post.name}`);
    }
  });
};

const handlePostLike = (data) => {
  //console.log(`in handle postlike`)
  //if (data.post.user_id === config.userId) {
  if (data.post.my_vote === 1) {
    console.log(`Account: ${data.post.user_id}, liked post #${data.post.id}`);
  }
  //}
};

const handleSavePost = (data) => {
  console.log(JSON.stringify(data, null, 2));
};

const getUserDetails = () => {
  ws.send(JSON.stringify({
    op: 'GetUserDetails',
    data: {
      username: config.username,
      sort: 'New',
      saved_only: false,
      auth: config.auth
    }
  }));
}

const host = 'www.chapo.chat';
var ws = new WebSocket('wss://' + host + '/api/v1/ws');
ws.on('open', () => {
  console.log('Connection succeed!');
  ws.on('message', (msg) => {
    try {
      const res = JSON.parse(msg);
      //console.log(res)
      switch (res.op) {
        case 'Search': {
          return handlePosts(res.data);
        }
        case 'GetUserDetails': {
          return console.log(msg);
        }
        case 'CreatePostLike': {
          return handlePostLike(res.data);
        }
        case 'SavePost': {
          return handleSavePost(res.data);
        }
        default: {
          break;
        }
      }
    } catch (e) {
        console.error(e);
    }
  });
  getPosts();
  setInterval(() => {
      getPosts();
  }, 30000)
});

