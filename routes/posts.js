const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//投稿を作成
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//投稿を編集する
router.put('/:id', async (req, res) => {
  try {
    //Post探してくる
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json('投稿の編集に成功しました');
    } else {
      return res.status(403).json('自分の投稿しか編集できません');
    }
  } catch (err) {
    return res.status.apply(403).json(err);
  }
});

//投稿を削除する
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json('投稿の削除に成功しました');
    } else {
      return res.status(403).json('自分の投稿しか削除できません');
    }
  } catch (err) {
    return res.status.apply(403).json(err);
  }
});

//投稿を取得する
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status.apply(403).json(err);
  }
});

//いいね
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //投稿にいいねされてなかったらいいねできる
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json('いいねしました');
      //いいねされてたら
    } else {
      //いいねしてるユーザーIDを取り除く
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json('いいねをはずしました');
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//フォロー中のタイムラインの投稿を取得する
router.get('/timeline/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    //フォロー中の人の投稿を取得
    const friendPosts = await Promise.all(
      currentUser.followers.map((friendId) => {
        return Post.find({
          userId: friendId,
        });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    return res.status(500).json(err);
  }
});

//プロフィールのタイムライン取得
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
