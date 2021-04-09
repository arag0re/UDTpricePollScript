let moment = require("moment");
let Web3 = require("web3");
let { request, gql } = require("graphql-request");
var block;

module.exports.getPriceAggregated = async function getPriceAggregated(days) {
  const pairDataAggregated =
    gql`{
        pairDayDatas(first": 150, orderBy": date, orderDirection": asc, where": {
          pairAddress": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
          date_gt": ` +
    moment().subtract(days, "days").unix() +
    `
        }) {
          date
          dailyVolumeToken0
          dailyVolumeToken1
          dailyVolumeUSD
          priceUSD
          reserveUSD    
        }
      }`;

  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    pairDataAggregated
  );
  cd;
  let pairDayData = response.pairDayDatas;
  console.log(await pairDayData);
  /*let dayData = []
        for (var i in pairDayData) {
              dayData.push(pairDayData[i])
        }
        //console.log(dayData[69])
        return dayData*/
};

module.exports.getBlock = async function getBlock() {
  return (await this.web3.eth.getBlock("latest")).number;
};
module.exports.getPrice = async function getPrice() {
  block = await this.getBlock();
  const pairdata =
    gql`
      {
        pair(id": "0x9ca8aef2372c705d6848fdd", block": { number": ` +
    block.toFixed(0) +
    `}) {
          token0 {
            id
            symbol
            name
            derivedETH
          }
          token1 {
            id
            symbol
            name
            derivedETH
          }
          reserve0
          reserve1
          reserveUSD
          trackedReserveETH
          token0Price
          token1Price
          volumeUSD
          txCount
        }
      }
    `;

  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    pairdata
  );

  return response;
};

module.exports.getDailyAggregated = async function getDailyAggregated() {
  let dailyData = gql`
    {
      tokenDayDatas(
        first": 150
        orderBy": date
        orderDirection": asc
        where": { token": "0x6b175474e89094c44da98b954eedeac495271d0f" }
      ) {
        id
        date
        priceUSD
        totalLiquidityToken
        totalLiquidityUSD
        totalLiquidityETH
        dailyVolumeETH
        dailyVolumeToken
        dailyVolumeUSD
      }
    }
  `;
  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    dailyData
  );
  return response;
};

module.exports.test = async function test(days, dayCount) {
  let testData =
    gql`{
            tokenDayDatas(first": ` +
    dayCount +
    `, orderBy": date, orderDirection": asc,
                where": {
                    token": "0x6b175474e89094c44da98b954eedeac495271d0f",
                    date_gt": ` +
    moment().subtract(days, "days").unix() +
    `
                }
            ) {
                id
                date
                priceUSD
                totalLiquidityToken
                totalLiquidityUSD
                totalLiquidityETH
                dailyVolumeETH
                dailyVolumeToken
                dailyVolumeUSD
            }
        }`;
  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    testData
  );
  let data = response.tokenDayDatas;
  let dayData = [];
  for (var i in data) {
    //console.log(data[i].date)
    let Day = {};
    Day.price = parseFloat(data[i].priceUSD);
    Day.time = new Date(data[i].date * 1000);
    dayData.push(Day);
  }
  dayData.shift();
  dayData.shift();
  console.log(dayData);
};

module.exports.getDaily = async function getDaily() {
  let daily = await this.getDailyAggregated();
  let dailyAggregated = daily.tokenDayDatas;
  let dayData = [];
  for (var i in dailyAggregated) {
    let lastDay = {};
    lastDay.price = parseFloat(dailyAggregated[i].priceUSD);
    lastDay.time = new Date(dailyAggregated[i].date * 1000);
    dayData.push(lastDay);
  }
  console.log(dayData);
  return dayData;
  //console.log(dailyAggregated)
};

module.exports.getMonthData = async function getMonthData() {
  let lastHundredDays = await this.getPriceAggregated();
  let lastMonth = [];
  //console.log(await this.getPriceAggregated())
  for (var i = 69; i <= 99; i++) {
    //console.log(lastHundredDays[i])
    let unformattedDate = moment(lastHundredDays[i].date * 1000);
    let stillUnformattedDate = unformattedDate.format(
      "dd MMM DD yyyy HH:mm:ss ZZ"
    );
    let splittedDate = stillUnformattedDate.split(" ");
    let finallyFormattedDate =
      splittedDate[0] +
      " " +
      splittedDate[1] +
      " " +
      splittedDate[2] +
      " " +
      splittedDate[3] +
      " " +
      splittedDate[4] +
      " GMT" +
      splittedDate[5] +
      " (Central European Summer Time)";
    let lastThirtyDays = {};
    lastThirtyDays.price =
      parseFloat(lastHundredDays[i].dailyVolumeToken0) /
      parseFloat(lastHundredDays[i].dailyVolumeToken1);
    lastThirtyDays.time = finallyFormattedDate;
    //console.log(Date(lastHundredDays[i].date))
    lastMonth.push(lastThirtyDays);
  }
  console.log("Month: ", lastMonth);
  //console.log("Moment",moment.now())
  return lastMonth;
};

module.exports.getYearData = async function getYearData() {
  let firstHundredFiftyDays = await this.getPriceAggregated(365);
  //console.log(firstHundredFiftyDays)
  let secondHundredFiftyDays = await this.getPriceAggregated(265);
  let LastYear = [];
  for (var i in firstHundredFiftyDays) {
    let lastYear = {};
    lastYear.price =
      parseFloat(firstHundredFiftyDays[i].dailyVolumeToken0) /
      parseFloat(firstHundredFiftyDays[i].dailyVolumeToken1);
    lastYear.time = new Date(firstHundredFiftyDays[i].date * 1000);
    LastYear.push(lastYear);
  }
  LastYear.shift();
  for (var i in secondHundredFiftyDays) {
    let lastYear = {};
    lastYear.price =
      parseFloat(secondHundredFiftyDays[i].dailyVolumeToken0) /
      parseFloat(secondHundredFiftyDays[i].dailyVolumeToken1);
    lastYear.time = new Date(firstHundredFiftyDays[i].date * 1000);
    LastYear.push(lastYear);
  }
  LastYear.splice(LastYear.indexOf(149));
  console.log(LastYear);
  return LastYear;
};

module.exports.getAccurateYearData = async function getAccurateYearData() {
  let firstHundred = await this.test(400, 100);
  let secondHundred = await this.test(300, 100);
  let thirdHundred = await this.test(200, 100);
  let fourthHoundred = await this.test(100, 100);
  let firstTokenDaysDatas = firstHundred.tokenDayDatas;
  let secondTokenDayDatas = secondHundred.tokenDayDatas;
  let thirdTokenDayDatas = thirdHundred.tokenDayDatas;
  let fourthTokenDayDatas = fourthHoundred.tokenDayDatas;
  let yearData = [];
  for (var i in firstTokenDaysDatas) {
    let lastYear = {};
    lastYear.price = parseFloat(firstTokenDaysDatas[i].priceUSD);
    lastYear.time = new Date(firstTokenDaysDatas[i].date * 1000);
    yearData.push(lastYear);
  }
  yearData.shift();
  yearData.shift();
  for (var b in secondTokenDayDatas) {
    let lastYear = {};
    lastYear.price = parseFloat(secondTokenDayDatas[b].priceUSD);
    lastYear.time = new Date(secondTokenDayDatas[b].date * 1000);
    yearData.push(lastYear);
  }
  yearData.splice(98, 2);
  for (var a in thirdTokenDayDatas) {
    let lastYear = {};
    lastYear.price = parseFloat(thirdTokenDayDatas[a].priceUSD);
    lastYear.time = new Date(thirdTokenDayDatas[a].date * 1000);
    yearData.push(lastYear);
  }
  yearData.splice(196, 2);
  for (var c in fourthTokenDayDatas) {
    let lastYear = {};
    lastYear.price = parseFloat(fourthTokenDayDatas[c].priceUSD);
    lastYear.time = new Date(fourthTokenDayDatas[c].date * 1000);
    yearData.push(lastYear);
  }
  yearData.splice(294, 2);
  return yearData;
};

module.exports.test1 = async function test1() {
  const pairdata =
    gql`{
          pairHourDatas(orderBy": hourStartUnix, orderDirection": asc, where": {
            pair": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
            hourStartUnix_gt": ` +
    moment().subtract(25, "hours").unix() +
    `
          }){
    		id
    		hourStartUnix
            reserve0
            reserve1
            reserveUSD
          }
         }`;

  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    pairdata
  );

  console.log(response.pairHourDatas);
};
module.exports.getETHPrice = async function getETHPrice() {
  let query = `{
      bundle(id": "1") {
        ethPrice;
      },
    }`;
  let response = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    query
  );
  console.log(response);
};
