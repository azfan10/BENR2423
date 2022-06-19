const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Visitor = require("./visitor");
const Inmate = require("./inmate");
const Visitorlog = require("./visitorlog")

MongoClient.connect(
	// TODO: Connection 
	"mongodb+srv://m001-student:m001-mongodb-basics@sandbox.can3v.mongodb.net",
	{ useNewUrlParser: true },
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async client => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Visitor.injectDB(client);
	Inmate.injectDB(client);
	Visitorlog.injectDB(client);
})

const express = require('express')
const app = express()
const port = process.env.PORT || 3030

const jwt = require ('jsonwebtoken');
function generateAccessToken(payload){
	return jwt.sign(payload, "secretcode", { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, "secretcode", (err, user) => {
		console.log(err);

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Prison Visitor Management System',
			version: '1.0.0',
		},
		components:{
			securitySchemes:{
				jwt:{
					type: 'http',
					scheme: 'bearer',
					in: "header",
					bearerFormat: 'JWT'
				}
			},
		security:[{
			"jwt": []
		}]
		}
	},
	apis: ['./main.js'], 
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: 
 *           type: string
 *         username: 
 *           type: string
 *         name:
 *           type: string
 *         officerNo:
 *           type: string
 *         rank:
 *           type: string
 *         phone:
 *           type: string
 *     Visitor:
 *       type: object
 *       propeties:
 *         _id: 
 *           type: string
 *         username: 
 *           type: string
 *         age:
 *           type: int32
 *         gender:
 *           type: string
 *         address:
 *           type: string
 *         relation:
 *           type: string          
 *     Inmate:
 *       type: object
 *       propeties:
 *         _id: 
 *           type: string
 *         Inmateno:
 *           type: string
 *         Firstname: 
 *           type: string
 *         Lastname: 
 *           type: string
 *         age:
 *           type: int32
 *         gender:
 *           type: string
 *             
 */

/**
 * @swagger
 * /login/user:
 *   post:
 *     description: User Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid username or password
 */

app.post('/login/user', async (req, res) => {
	console.log(req.body);

	let user = await User.login(req.body.username, req.body.password);
	
	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}

	res.status(200).json({
		username: user.username,
		name: user.Name,
		officerNo: user.officerNo,
		rank: user.Rank,
		phone: user.Phone,
		token: generateAccessToken({ rank: user.Rank })

	});
})

/**
 * @swagger
 * /login/visitor:
 *   post:
 *     description: Visitor Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visitor'
 *       401:
 *         description: Invalid username or password
 */

app.post('/login/visitor', async (req, res) => {
	console.log(req.body);

	let user = await Visitor.login(req.body.username, req.body.password);
	// console.log(user);
	// console.log(user.status);
	
	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}

	res.status(200).json({
		username: user.username,
		name: user.Name,
		age: user.Age,
		gender: user.Gender,
		address: user.Address,
		relation: user.Relation,
		token: generateAccessToken({ username: user.username })
	});
})

/**
 * @swagger
 * /register/user:
 *   post:
 *     description: User Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               name: 
 *                 type: string
 *               officerNo:
 *                 type: string
 *               rank:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/user', async (req, res) => {
	console.log(req.body);

	const reg = await User.register(req.body.username, req.body.password, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
	console.log(reg);

	res.json({reg})
})

/**
 * @swagger
 * /register/visitor:
 *   post:
 *     description: Visitor Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               name: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *               relation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visitor'
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/visitor', async (req, res) => {
	console.log(req.body);

	const reg = await Visitor.register(req.body.username, req.body.password, req.body.name, req.body.age, req.body.gender, req.body.address, req.body.relation);
	console.log(reg);

	res.json({reg})
})

app.use(verifyToken);

/**
 * @swagger
 * /register/inmate:
 *   post:
 *     security:
 *      - jwt: []
 *     description: Inmate Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               Inmateno: 
 *                 type: string
 *               Firstname: 
 *                 type: string
 *               Lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *              
 *     responses:
 *       200:
 *         description: Successful registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inmate'
 *       401:
 *         description: There is an error during registration , Please try again
 */

 app.post('/register/inmate', async (req,res)=>{
	console.log(req.body)

	const reg = await Inmate.register(req.body.Inmateno, req.body.Firstname, req.body.Lastname, req.body.age, req.body.gender );
console.log(reg);

res.json({reg})

})

/**
 * @swagger
 * /user/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: User Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               name: 
 *                 type: string
 *               officerNo:
 *                 type: string
 *               rank:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/user/update', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer"){
		const update = await User.update(req.body.username, req.body.name, req.body.phone);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}

})

/**
 * @swagger
 * /visitor/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: Visitor Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               name: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *               relation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/visitor/update', async (req, res) => {
	console.log(req.body);

	if (req.user.username == req.body.username){
		const update = await Visitor.update(req.body.username, req.body.name, req.body.age, req.body.gender, req.body.address, req.body.relation);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /inmate/update:
 *   patch:
 *     security:
 *      - jwt: []
 *     description: Inmate Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               password: 
 *                 type: string
 *               Inmateno: 
 *                 type: string
 *               Firstname: 
 *                 type: string
 *               Lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inamte'
 *       401:
 *         description: There is an error during updating , Please try again
 */

 app.patch('/inmate/update', async (req, res) => {
	console.log(req.body);
	if (req.user.rank == "officer"){
		const update = await Inmate.update( req.body.Inmateno, req.body.Firstname, req.body.Lastname, req.body.age, req.body.gender);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/user:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: User Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/user', async (req, res) => {
	if (req.user.rank == "officer"){
		const del = await User.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/visitor:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete Visitor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visitor'
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/visitor', async (req, res) => {
	if (req.user.rank == "officer"){
		const del = await Visitor.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/Inmate:
 *   delete:
 *     security:
 *      - jwt: []
 *     description: Delete Inmate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               Inmateno: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inmate'
 *       401:
 *         description: There is an error during deleting , Please try again
 */

 app.delete('/delete/inmate', async (req, res) => {
	const del = await Inmate.delete(req.body.Inmateno)

	res.json({del})

})

app.get('/visitor/:id', async (req, res) => {
	console.log(req.params.id);

	res.status(200).json({})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})