const { query } = require('express');
const User = require('../models/User');
const router = require('express').Router();

//CRUD
//ユーザー情報の更新
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json('ユーザー情報が更新されました');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('自身のアカウントのみ更新可能です');
  }
});

//ユーザーの削除
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json('ユーザー情報が削除されました');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('自身のアカウントのみ削除可能です');
  }
});

// //ユーザーの取得
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, updatedAt, ...other } = user._doc;
//    return res.status(200).json(other);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

//クエリでユーザー情報取得
router.get('/', async (req, res) => {
  const userId = req.query.userId
  const username = req.query.username
  try {
const user  = userId ? await User.findById(userId): await User.findOne({username:username})
    const { password, updatedAt, ...other } = user._doc;
   return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});


//ユーザーのフォロー
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.userId) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーに自分がいなかったらフォローできる
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        }),
          await currentUser.updateOne({
            $push: {
              followings: req.params.id,
            },
          });
        return res.status(200).json('フォローしました');
      } else {
        return res
          .status(403)
          .json('あなたは既にこのユーザーをフォローしています');
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json('自分自身をフォローはできません');
  }
});

//ユーザーのフォローをはずす
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.userId) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      //フォロワーに存在したらフォローを外せる
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        }),
          await currentUser.updateOne({
            $pull: {
              followings: req.params.id,
            },
          });
        return res.status(200).json('フォロー解除しました');
      } else {
        return res.status(403).json('このユーザーをフォロー解除できません');
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json('自分自身のフォロー解除はできません');
  }
});

module.exports = router;
