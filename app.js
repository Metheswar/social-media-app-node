
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;


const sequelize = new Sequelize('metheswar', 'root', 'Methi@2304', {
  host: 'localhost',
  dialect: 'mysql',
});

const Post = sequelize.define('Post', {
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


const Comment = sequelize.define('Comment', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


Post.hasMany(Comment);
Comment.belongsTo(Post);


sequelize.sync({ force: true , alter : true}).then(() => {
  console.log('Database synced');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static('public'));


app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({ include: Comment });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/comment/:postId', async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = await Comment.create({ text: comment });
    await post.addComment(newComment);

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/post', async (req, res) => {
  try {
    const { imageUrl, description } = req.body;
    await Post.create({ imageUrl, description });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
