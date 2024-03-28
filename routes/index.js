var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./posts');
var storyModel = require('./stories');
var passport = require('passport');
const localStrategy = require('passport-local');
var upload = require('./multer');
const users = require('./users');


passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res) {
  res.render('login', { footer: false, error:req.flash('error') });
});

router.get('/newAccount', function (req, res) {
  res.render('index', { footer: false, error: req.flash('error') });
});

router.get('/feed', isLoggedIn, async function (req, res) {
  let obj = {};
  const posts = await postModel.find().populate('user')
  const user = await userModel.findOne({ username: req.session.passport.user })
  const stories = await storyModel.find({ user: { $nin: user._id } }).populate('user')
  const pack = stories.filter(story => {
    if (!obj[story.user]) {
      obj[story.user] = {};
      return true;
    } else return false;
  })
  res.render('feed', { footer: true, posts, pack, user });
});

router.get('/story', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('stories')
  const Story = await user.stories.pop().populate('user')
  res.render('story', { footer: false, Story });
});

router.get('/story/:a/:number', isLoggedIn, async function (req, res) {
  const storyUser = await userModel.findOne({ _id: req.params.a }).populate('stories')
  if (req.params.number < storyUser.stories.length)
    res.render('story', { footer: false, storyUser, number: req.params.number });
  else {
    res.redirect('/feed')
  }
});

router.post('/upload/pic', isLoggedIn, upload.single('file'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.pic = req.file.filename;
  await user.save();
  res.redirect('back')
});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('posts')
  res.render('profile', { footer: true, user });
});


router.get('/search', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('posts')
  res.render('search', { footer: true, user });
});

router.get('/search/:a', async function (req, res) {
  let value = req.params.a;
  const users = await userModel.find({ username: new RegExp('^' + value, 'i') })
  res.json(users);
});

router.get('/edit', isLoggedIn, upload.single('file'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('edit', { footer: true, user });
});

router.post('/update', async function (req, res) {
  const user = await userModel.findOneAndUpdate({ username: req.session.passport.user }, {
    username: req.body.username,
    name: req.body.name,
    bio: req.body.bio
  }, { new: true })

  req.login(user, function (err) {
    if (err) throw err;
    res.redirect('/profile')
  })
});

router.get('/upload', function (req, res) {
  res.render('upload')
})

router.post('/upload/post', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  if (req.body.type === 'Post') {
    const post = await postModel.create({
      pic: req.file.filename,
      caption: req.body.caption,
      user
    })
    await user.posts.push(post);
  } else if (req.body.type === 'Story') {
    const story = await storyModel.create({
      pic: req.file.filename,
      user
    })
    await user.stories.push(story);
  }

  await user.save();
  res.redirect('/feed')
});

router.get('/post/like/:postId', isLoggedIn, async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postId })
  const user = await userModel.findOne({ username: req.session.passport.user })
  if (!post.likes.includes(user._id)) { post.likes.push(user._id) }
  else { post.likes.splice(user._id, 1) }
  await post.save();
  res.json(post)
})

router.get('/post/save/:a', isLoggedIn, async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.a })
  const user = await userModel.findOne({ username: req.session.passport.user })
  if (!post.saved.includes(user._id)) {
    post.saved.push(user._id)
  }
  else {
    post.saved.splice(user._id, 1)
  }
  await post.save();
  res.json(post)
})

router.post('/register', function (req, res) {
  let userDets = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  };
  userModel.register(userDets, req.body.password)
    .then(function (result) {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/profile');
      })
    })
    .catch((err) => {
      req.flash('error', err.message)
      res.redirect('/newAccount')
    })
})


router.post('/login', passport.authenticate('local', {
  successRedirect: '/feed',
  failureRedirect: '/',
  failureFlash:true
}), function (req, res) { })


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}



router.get('/logout', function (req, res, next) {
  if (req.isAuthenticated())
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  else {
    res.redirect('/')
  }
})
module.exports = router;
