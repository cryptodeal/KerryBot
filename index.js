const request = require('request');
const WebSocket = require('ws');
require('dotenv').config();


const config = {
    auth: process.env.LEMMY_JWT,
    username: process.env.LEMMY_USERNAME,
    userId: process.env.LEMMY_USERID
};

const POST_CACHE_LENGTH = 1000;
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
  keywords = ['Kerry', 'wreckers', 'brigaders', 'brigadiers', 'spammers', 'spam', 'alts', 'Kerryposters', 'Kerryposting', 'kerry posters', 'kerry posting']
  keywords.map(key => {
    console.log(`Search Posts: '${key}'`);
    ws.send(JSON.stringify({
      op: 'Search',
      data: {
        limit: 20,
        page: 1,
        q: key,
        sort: "New",
        type_: "Posts"
        //type_: 'All',
        //sort: 'New'
      }
    }));
  })
};

const likePost = (postId) => {
    console.log('Liking Post');
    ws.send(JSON.stringify({
        op: 'CreatePostLike',
        data: {
            post_id: postId,
            score: 1,
            auth: config.auth
        }
    }));
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
    if (data.post.user_id === config.userId) {
        if (data.post.my_vote === 1) {
            console.log(`Liked post #${data.post.id}`);
        }
    }
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
    }, 10000)
});

