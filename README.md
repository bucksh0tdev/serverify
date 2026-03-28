# Serverify v1

Serverify v1, MTA:SA sunucularını listelemek, oylatmak ve Discord üzerinden doğrulamak için hazırlanmış bir Node.js projesidir. Uygulama iki parçadan oluşur:

- Discord botu
- Express tabanlı web paneli

Kullanıcılar Discord ile giriş yaparak kendi sunucularını panele başvuru olarak ekler. Başvurular, belirlenen Discord sunucusundaki onay kanalına düşer. Yetkililer başvuruyu kabul ettiğinde sunucu listede görünür, reddedildiğinde kayıt kaldırılır.

## Öne Çıkan Özellikler

- Discord OAuth2 ile giriş sistemi
- Discord sunucu sahipliğine göre başvuru oluşturma
- Butonlu başvuru onay ve red akışı
- En yeni sunucular listesi
- En çok oynanan sunucular sayfası
- En çok oy alan sunucular sayfası
- Kullanıcının kendi eklediği sunucuları görmesi
- JSON çıktı veren basit API
- Dinamik logo boyutlandırma servisi
- `sitemap.xml`, `robots.txt` ve servis çalışanı (`sw.js`) üretimi
- MTA:SA resmi API verisini periyodik olarak önbelleğe alma
- Oyların belirli aralıkla sıfırlanması

## Nasıl Çalışır?

Sistemin temel akışı şöyledir:

1. Kullanıcı Discord hesabı ile giriş yapar.
2. Sahibi olduğu Discord sunucularından birini seçerek başvuru gönderir.
3. Girilen IP ve port bilgisi, MTA:SA API verisi ile doğrulanır.
4. Başvuru, onay için Discord kanalına butonlu mesaj olarak iletilir.
5. Yetkili kabul ederse sunucu aktif listeye alınır.
6. Ziyaretçiler listedeki sunuculara oy verebilir.

## Teknolojiler

- Node.js 16.x
- Express
- EJS
- Discord.js v13
- Passport Discord
- csy.db
- Tailwind CSS
- Sharp
- Axios

## Proje Yapısı

```text
serverify-v1/
├── config.js                # Temel yapılandırma
├── index.js                 # Uygulama başlangıç noktası
├── discord/
│   └── index.js             # Discord botu ve web sunucusu başlatma
├── functions/
│   └── global.js            # Genel yardımcı fonksiyonlar ve veri erişimi
├── views/
│   ├── index.js             # Express görünüm kurulumu
│   ├── libs/
│   │   ├── global.js        # Panel yardımcıları, session ve passport ayarları
│   │   └── subs/main.js     # Tüm route tanımları
│   ├── styles/              # Tailwind kaynakları ve statik dosyalar
│   └── views/               # EJS sayfa şablonları
└── databases/               # Yerel veri dosyaları
```

## Gereksinimler

Projeyi çalıştırmadan önce aşağıdakilerin hazır olması gerekir:

- Node.js `16.x`
- npm
- Oluşturulmuş bir Discord uygulaması ve botu
- Discord OAuth2 bilgileri
- Botun bulunduğu bir yönetim sunucusu
- Başvuru mesajlarının düşeceği bir kanal
- Web panelinin erişeceği bir alan adı veya IP

## Kurulum

### 1. Depoyu indir

```bash
git clone <repo-url>
cd serverify-v1
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Yapılandırmayı düzenle

`config.js` dosyasını kendi ortamınıza göre doldurun.

```js
module.exports = {
  refresh: 50000,
  voteRefresh: 604800000,
  maintence: false,
  web: {
    title: "Serverify",
    url: "http://IP:3000",
    description: "Mta-Sa Sunucu Bul/Paylaş!",
    keywords: ["mta-sa", "mta-sa sunucu", "mta-sa api"],
    port: 3000
  },
  bot: {
    id: "BOT ID",
    token: "BOT TOKEN",
    owner: ["BOT OWNER"],
    secret: "BOT OAUTH2 SECRET KEY",
    callback: "http://IP:3000/callback",
    scopes: ["identify", "guilds"],
    invite: "https://discord.com/oauth2/authorize?scope=bot+applications.commands&client_id=BOT-ID&permissions=8",
    server: "BOT APPROVE SERVER",
    channel: "BOT APPROVE CHANNEL",
    ready: "https://instagram.com/bucksh0tdev"
  }
}
```

### 4. Uygulamayı başlat

```bash
npm start
```

Uygulama varsayılan olarak `config.js` içindeki `web.port` değeri üzerinden ayağa kalkar.

## Tailwind Derleme

Stil dosyalarını yeniden üretmek için:

```bash
npm run tailwind
```

Bu komut, `views/styles/tailwindcss.css` dosyasını derleyip `views/styles/static/styles.css` çıktısını üretir.

## Önemli Yapılandırma Alanları

### `web`

- `title`: Site başlığı
- `url`: Panelin tam adresi
- `description`: Meta açıklaması
- `keywords`: SEO anahtar kelimeleri
- `port`: Express uygulamasının çalışacağı port

### `bot`

- `id`: Discord uygulama kimliği
- `token`: Bot tokenı
- `owner`: Kara liste komutlarını kullanabilecek kullanıcı kimlikleri
- `secret`: OAuth2 client secret
- `callback`: Discord giriş dönüş adresi
- `scopes`: OAuth2 izinleri
- `invite`: Bot davet bağlantısı
- `server`: Başvuruların yönetileceği Discord sunucu kimliği
- `channel`: Başvuruların iletileceği kanal kimliği
- `ready`: Bot durumunda gösterilecek ifade

## Route Özeti

### Web Sayfaları

- `/`: En yeni sunucular
- `/players`: En çok oyunculu sunucular
- `/votes`: En çok oy alan sunucular
- `/myservers`: Kullanıcının eklediği sunucular
- `/request`: Yeni sunucu başvuru formu
- `/login`: Discord ile giriş
- `/callback`: Discord OAuth dönüş rotası
- `/invite`: Bot davet bağlantısı
- `/exit`: Çıkış

### API ve Yardımcı Rotalar

- `/api`: Aktif sunucuları JSON olarak döner
- `/api/logo?width=128&height=128`: Logoyu istenen boyuta göre döner
- `/sitemap.xml`: Sitemap çıktısı
- `/robots.txt`: Robots dosyası
- `/sw.js`: Basit servis çalışanı

## Veri Yapısı

Projede veriler `csy.db` ile yerel dosyada tutulur. Sunucu kayıtları `server_<discordSunucuId>` formatında saklanır. Tipik bir kayıt şu alanları içerir:

```js
{
  ip: "127.0.0.1",
  port: 22003,
  long: "Kısa açıklama",
  server: 123456789012345678,
  status: 0,
  likes: [],
  owner: "kullanici_id",
  date: 1710000000000
}
```

`status` alanı:

- `0`: Onay bekliyor
- `1`: Aktif
- `2`: Kara listede

## Onay ve Yönetim Akışı

Bir kullanıcı başvuru gönderdiğinde bot, belirlenen yönetim kanalına butonlu bir mesaj yollar:

- `Kabul`: Sunucuyu aktif eder
- `Red`: Kaydı siler

Ayrıca bot sahipleri aşağıdaki mesaj komutlarını kullanabilir:

- `!addblacklist <sunucuId>`
- `!removeblacklist <sunucuId>`
- `!blacklist`

## Dikkat Edilmesi Gerekenler

- `callback` adresi ile Discord Developer Portal içindeki yönlendirme adresi birebir aynı olmalıdır.
- `web.url` alanı, panelin gerçek erişim adresi ile uyumlu olmalıdır.
- Botun, başvuru yapılacak Discord sunucularına eklenebilmesi gerekir.
- Başvuru doğrulaması, MTA:SA API önbelleğine göre yapılır. Sunucu API tarafında görünmüyorsa başvuru başarısız olabilir.
- `databases/` klasörü yazılabilir olmalıdır.

## Geliştirme Notları

- Uygulama açıldığında hem Discord botu hem web paneli birlikte başlar.
- `global.autoreload()` düzenli olarak MTA:SA API verisini çeker.
- Oylar `voteRefresh` süresi dolunca sıfırlanır.
- Hata ve 404 sayfaları özel EJS şablonları ile sunulur.

## Lisans

Bu proje `Apache-2.0` lisansı ile sunulmaktadır.
