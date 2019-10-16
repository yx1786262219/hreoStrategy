const express = require('express')
const app = express()
const mysql = require('mysql')
var https = require('https')
var bodyParder = require('body-parser')
const multer = require('multer')

app.use(bodyParder.urlencoded({ extended: false }))
app.listen(5000, () => {
    // 打印一下
    console.log('5000端口服务开启')
})

app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
})

const conn = mysql.createConnection({
    host: '47.105.167.103',
    user: 'root',
    password: '123456',
    database: 'hero'
})

function getRayload(req) {
    var str = '';
    req.on('data', function (dt) {
        str += dt
    })
    let q = new Promise((resolve, reject) => {
        req.on('end', function () {
            resolve(JSON.parse(str));
        })
    })
    return q;
}

app.post('/survey', (req, res) => {
    getRayload(req).then(res => {
        console.log(res)
        const sqlStr = "INSERT INTO from_hero (type,garbage,hero,remark) VALUES ('" + res.type.join(',') + "','" + res.garbage.join(',') + "','" + res.hero.join(',') + "','" + res.desc + "')";
        // const sqlStr = "INSERT INTO from_hero (type,garbage,hero,remark) VALUES ('xixi','haha','hehe','heng')";
        // const sqlStr = "select * from evaluate where id = '1'";
        return sqlStr
    }).then(sqlStr => {
        console.log(sqlStr)
        conn.query(sqlStr, (err, results) => {
            if (err) return res.json({ err_code: 0, message: '提交失败', affectedRows: 0 })
            if (results) return res.json({ err_code: 0, message: '提交成功', affectedRows: 0 })
        })
    })
})

app.post('/getForm', (req, res) => {
    const sqlStr = "select * from from_hero"
    conn.query(sqlStr, (err, results) => {
        if (err) return res.json({ err_code: 0, message: '获取失败', affectedRows: 0 })
        if (results) return res.json({ err_code: 0, message: results, affectedRows: 0 })
    })
})

app.post('/uploadImg', (req, res) => {
    getRayload(req).then(res => {
        console.log(res)
        const sqlStr = "INSERT INTO nice_picture (imgUrl, imgType) VALUES ('" + res.fileList.join(',') + "','" + res.type.join(',') + "')";
        return sqlStr
    }).then(sqlStr => {
        conn.query(sqlStr, (err, results) => {
            if (err) return res.json({ err_code: 0, message: '提交失败', affectedRows: 0 })
            if (results) return res.json({ err_code: 0, message: '提交成功', affectedRows: 0 })
        })
    })
})
var a = 1
//配置diskStorage来控制文件存储的位置以及文件名字等
var storage = multer.diskStorage({
    //确定图片存储的位置
    destination: function (req, file, cb) {
        cb(null, './uploadImgs')
    },
    // ![](http://images2017.cnblogs.com/blog/1283058/201802/1283058-20180201154342296-515041615.png)
    //确定图片存储时的名字,注意，如果使用原名，可能会造成再次上传同一张图片的时候的冲突
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});
//生成的专门处理上传的一个工具，可以传入storage、limits等配置
var upload = multer({ storage: storage });
//接收上传图片请求的接口
app.post('/upload', upload.single('file'), function (req, res, next) {
    //图片已经被放入到服务器里,且req也已经被upload中间件给处理好了（加上了file等信息）
    //线上的也就是服务器中的图片的绝对地址
    var url = '/uploadImgs/' + req.file.filename
    res.json({
        code: 200,
        data: url
    })
});
var a = 1