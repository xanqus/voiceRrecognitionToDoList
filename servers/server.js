const express = require("express");

const app = express();

const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const FileReader = require("filereader");
const fs = require("fs");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const port = process.env.PORT || 3001;

// 네이버 음성합성 Open API 예제

app.use(cors());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api", (req, res) => res.json({ username: "bryan" }));

app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/tts", function (req, res) {
  const client_id = "wkwwotlthp";
  const client_secret = "pRjlZQqqpu39nPC1W5MZVGJxh41sN1Rj7zEtnNKE";
  const api_url = "https://naveropenapi.apigw.ntruss.com/voice/v1/tts";
  const request = require("request");
  const options = {
    url: api_url,
    form: { speaker: "mijin", speed: "0", text: "좋은 하루 되세요" },
    headers: {
      "X-NCP-APIGW-API-KEY-ID": client_id,
      "X-NCP-APIGW-API-KEY": client_secret,
    },
  };
  const writeStream = fs.createWriteStream("./tts1.mp3");
  const _req = request.post(options).on("response", function (response) {
    console.log(response.statusCode); // 200
    console.log("header", response.headers["content-type"]);
  });
  _req.pipe(writeStream); // file로 출력
  _req.pipe(res); // 브라우저로 출력
});

app.post("/stt", multipartMiddleware, function (req, res) {
  console.log("blobData", req.files["audio-file"]["path"]);
  const clientId = "2894r98ez2";
  const clientSecret = "96OIRXfcyNR5cn18dvMg1AHa3IPiZOM9D4MZJsc0";
  const request = require("request");
  const url = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor";
  const content = req.query.blobData;

  try {
    fs.open("test.mp3", "w+", function (err, fd) {
      if (err) throw err;
      console.log("file open complete");
    });
    fs.writeFile(
      "test.mp3",
      req.files["audio-file"],
      "base64",
      function (error) {
        console.log("write end");
      }
    );
    const requestConfig = {
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
      body: fs.createReadStream(req.files["audio-file"]["path"]),
    };
    request(requestConfig, (err, response, body) => {
      /*fs.unlink("servers/etc/test.mp3", (err) => {
      console.log(err);
    });*/
      if (err) {
        console.log(err);
        return;
      }
      console.log(response.statusCode);
      console.log("body", body);

      res.json({ body: body });
    });

    return "hi";
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`express is running on ${port}`);
});
