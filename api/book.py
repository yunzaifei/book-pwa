import urllib
import requests
import http.cookiejar as cookielib
from bs4 import BeautifulSoup, NavigableString, Tag
import os, json, re, ssl

ssl._create_default_https_context = ssl._create_unverified_context

userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0'

class PiaotianSpider(object):
    def __init__(self):
        self.piaotian_url_base = 'https://piaotian.com'
        headers = { 'User-Agent': userAgent }
        ptSession = requests.session()
        ptSession.cookies = cookielib.LWPCookieJar(filename='cookie.txt')
        ptSession.headers = headers
        self.ptSession = ptSession
        self.login()
        self.getbooklist()

        self.books = []
        self.contents = []
        self.oldNum = {}
        if os.path.exists('./book.json'):
            with open('./book.json', 'r', encoding="utf-8") as f:
                # print(f.read())
                jsonf = json.loads(f.read())
                self.contents = jsonf['contents']
                for b in jsonf['books']:
                    self.oldNum[b['id']] = b['num']

    # 获取书籍封面信息
    def browser_bookInfo(self):
        for i in range(0, len(self.book_list)):
            url = self.book_list[i]['url']
            id = re.findall(r'aid=(.+?)&', url)[0]
            html = self.browser_html(self.book_list[i]['url'])
            bf = BeautifulSoup(html, features="html.parser")
            img = bf.select_one('#content img[align=right]')['src']
            obj = {'id': id, 'name': self.book_list[i]['name'],
                   'img': img, 'num': 0, 'newTitle': ''}
            self.books.append(obj)
            to_url = bf.select_one('#content a')['href']
            #print(to_url)
            self.browser_bookMenu(self, to_url, i)

    # 模拟登录
    def login(self):
        url = self.piaotian_url_base + '/login.php?do=submit&jumpurl=/modules/article/bookcase.php'
        username = input('输入用户名：')
        password = input('输入密码：')
        data = { 'username': username, 'password': password, 'action': 'login' }
        self.ptSession.post(url=url, data=data, verify=False)
        self.ptSession.cookies.save()

    # 获取书架列表
    def getbooklist(self):
        books_url = self.piaotian_url_base + '/modules/article/bookcase.php'
        response = self.ptSession.get(books_url, verify=False)
        html = response.text
        bf = BeautifulSoup(html, features="html.parser")
        links = bf.select('.grid td a')
        #print('links', links)
        books = []
        for i in range(0, len(links)):
            if i%5 == 0:
                #print('href', links[i])
                books.append({'name': links[i].text, 'url': links[i]['href']})
        self.book_list = books

    # 获取书籍章节目录
    @staticmethod
    def browser_bookMenu(self, url, i):
        html = self.browser_html(url)
        bf = BeautifulSoup(html, features="html.parser")
        titles = bf.select('.centent li a')
        id = self.books[i]['id']
        startI = 0
        if self.oldNum[id] is not None:
            startI = self.oldNum[id]
        self.books[i]['num'] = len(titles)
        self.books[i]['newTitle'] = titles[-1].text
        for j in range(startI, len(titles)):
            print(titles[j].text)
            k = self.getContentIndex(self, i, j)
            self.contents.insert(k, {'id': (id + '_' + str(j)), 'bookId': id,
                                  'index': j, 'title': titles[j].text, 'content': []})
            to_url = url + titles[j]['href']
            self.browser_bookContent(self, to_url, i, k)

    @staticmethod
    def getContentIndex(self, i, j):
        k = 0
        for l in range(0, i):
            k += self.books[l]['num']
        k += j
        return k

    # 获取书籍章节内容
    @staticmethod
    def browser_bookContent(self, url, i, k):
        html = self.browser_html(url).decode('gb2312', 'ignore')
        # print(html)
        bf = BeautifulSoup(html, features="html.parser")
        for br in bf.find_all('br'):
            next_s = br.nextSibling
            if not (next_s and isinstance(next_s, NavigableString)):
                continue
            next2_s = next_s.nextSibling
            if next2_s and isinstance(next2_s, Tag) and next2_s.name == 'br':
                text = str(next_s).strip()
                #print(text)
                self.contents[k]['content'].append(text)

    @staticmethod
    def browser_html(url):
        headers = {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'}
        try:
            response = urllib.request.Request(url, headers=headers)
            result = urllib.request.urlopen(response)
            html = result.read()
            return html
        except urllib.error.HTTPError as e:
            if hasattr(e, 'code'):
                print(e.code)
        except urllib.error.URLError as e:
            if hasattr(e, 'reason'):
                print(e.reason)


if __name__ == '__main__':
    piaotian = PiaotianSpider()
    piaotian.browser_bookInfo()
    with open('./book.json', 'w', encoding="utf-8") as dump_f:
        json.dump({'books': piaotian.books,
                   'contents': piaotian.contents}, dump_f, ensure_ascii=False)
    print('----保存json文件完成！----')
