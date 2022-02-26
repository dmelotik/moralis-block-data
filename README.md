## Task

Use [Moralis](https://docs.moralis.io/)

given a range of blocks and number of blocks in 30 mins

input start and end block


for every 30 min interval
return moralis data to get price data
return an array with timestamp and price from moralis callback data

starting block += blocks in 30

[Use this Moralis Function](https://docs.moralis.io/moralis-server/web3-sdk/token#gettokenprice)


## Setup/Run

```sh
$ npm install
$ node BlockData.js
```