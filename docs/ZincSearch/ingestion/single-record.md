# Single record

## curl

```shell
curl \
  -u admin:Complexpass#123 \
  -XPUT \
  -d '{"author":"Prabhat Sharma"}' \
  http://localhost:4080/api/myshinynewindex/_doc
```

## Python

```py
import base64, json
import requests

user = "admin"
password = "Complexpass#123"
bas64encoded_creds = base64.b64encode(bytes(user + ":" + password, "utf-8")).decode("utf-8")


data = {
    "Athlete": "DEMTSCHENKO, Albert",
    "City": "Turin",
    "Country": "RUS",
    "Discipline": "Luge",
    "Event": "Singles",
    "Gender": "Men",
    "Medal": "Silver",
    "Season": "winter",
    "Sport": "Luge",
    "Year": 2006
  }

headers = {"Content-type": "application/json", "Authorization": "Basic " + bas64encoded_creds}
index = "olympics"
zinc_host = "http://localhost:4080"
zinc_url = zinc_host + "/api/" + index + "/_doc"

res = requests.put(zinc_url, headers=headers, data=json.dumps(data))

```

## Golang

```golang
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func main() {
    data := `{
        "Athlete": "DEMTSCHENKO, Albert",
        "City": "Turin",
        "Country": "RUS",
        "Discipline": "Luge",
        "Event": "Singles",
        "Gender": "Men",
        "Medal": "Silver",
        "Season": "winter",
        "Sport": "Luge",
        "Year": 2006
    }`
    req, err := http.NewRequest("POST", "http://localhost:4080/api/games3/_doc", strings.NewReader(data))
    if err != nil {
        log.Fatal(err)
    }
    req.SetBasicAuth("admin", "Complexpass#123")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
    log.Println(resp.StatusCode)
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(string(body))
}
```
