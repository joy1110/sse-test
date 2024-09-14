const rx = require('rxjs');
const operators = require('rxjs/operators');
const express = require('express');
const cors = require('cors');

const { timer, Subject } = rx;
const { map, take, last, takeUntil } = operators

const app = express();

const corsOptions = {
  origin: 'http://localhost:1234',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

const messageForStream = '從前有一位叫阿翔的年輕人，他住在一個充滿山林的小村莊裡。阿翔從小就對天空中的星星充滿著好奇，每個夜晚他都會躺在家外的草地上，數著無盡的星星，幻想著如果能飛到星星上，會是什麼樣子。有一天晚上，一顆流星從天空劃過，阿翔忍不住心中的願望，閉上眼睛許願道：「我希望能夠飛到星星上，探索那裡的秘密。」他不知道的是，這顆流星其實是來自一顆魔法星球，專門實現願望。當阿翔睜開眼睛時，他突然發現自己浮在空中，而且越飛越高！他的身體輕如羽毛，竟然真的朝著星星的方向飛去。他穿越雲層，飛過鳥兒，越過高山，直到進入了神秘的宇宙。不久，阿翔到達了一顆亮閃閃的星星上。這裡的景色令人驚嘆——地面是由純銀和鑽石構成的，空氣中漂浮著柔和的光芒。而在星星的中央，有一棵發光的大樹，樹上結滿了閃閃發亮的果實。突然，樹下走出了一個長著透明翅膀的生物，像是個小精靈。她對阿翔說：「歡迎來到星辰之國！這裡的每一顆果實都蘊含著一個秘密，它們是來自不同星球的夢想與願望。你可以選擇一顆果實，了解一個星球的故事。」阿翔驚奇地選了一顆最閃亮的果實，剛剛觸碰到它，果實就裂開了，裡面展現出了一個畫面——那是一個充滿色彩的世界，裡面的生物互相合作，建造了令人驚嘆的城市，創造了無數美麗的藝術。阿翔心中充滿了感動，他從中學到了許多關於團結與創造的道理。最後，小精靈告訴阿翔：「每顆星星其實都是一個夢想，像你這樣的人們每天仰望天空，就是在為這些夢想添上光芒。」阿翔笑著回到了地球，從此，他不再只是看星星，還開始努力地追尋自己的夢想。因為他知道，每個心中的願望，終將會有實現的一天，就像那夜空中的星星一樣閃耀。這個故事告訴我們，夢想或許遠在天邊，但只要懷抱希望，勇敢追尋，奇蹟或許比你想像的更近。';

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stopSignal = new Subject();

  // suppose we fetch data from database or other source, and need to handle error
  try {
    const streamSource$ = timer(1000, 20).pipe(
      map((i) => messageForStream.slice(0, i)),
      take(messageForStream.length + 1),
      takeUntil(stopSignal),
    )

    streamSource$.subscribe((message) => {
      res.write(`data: ${message}\n\n`);
    });

    streamSource$.pipe(last()).subscribe(() => {
      // For clients who using eventSource, connection must be closed by them
      // Otherwise, an error will be thrown by eventSource
      // Here we send a custom event to tell clients that the stream is done
      res.write('event: done\n')
      res.write('data: \n\n')
    });
  } catch (error) {
    console.error(error);
    res.status(500).end('Server encounter an unexpected error');
  };

  req.on('close', () => {
    console.log('Client closed the connection');
    // do some clean up here
    stopSignal.next();
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

