// import { PairHourData } from './../types/schema'
/* eslint-disable prefer-const */
import { BigInt, BigDecimal} from '@graphprotocol/graph-ts'
import { toDecimal } from './helpers';
import {StratHarvest, TombFees} from "../generated/StrategyCommonChefLPProxy/StrategyCommonChefLPProxy";
import { StrategyDayData, StrategyData, FeesData } from "../generated/schema";


export function pow(base: BigDecimal, exponent: number): BigDecimal {
  let result = base;

  if (exponent == 0) {
    return BigDecimal.fromString('1');
  }

  for (let i = 2; i <= exponent; i++) {
    result = result.times(base);
  }

  return result;
}


export function updateStrategyDayData(event: StratHarvest): StrategyDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let strategyDayData = StrategyDayData.load(dayID.toString())
  if (strategyDayData === null) {
    strategyDayData = new StrategyDayData(dayID.toString())
    strategyDayData.date = dayStartTimestamp
    strategyDayData.earned = BigDecimal.fromString('0');
    strategyDayData.tvl = BigDecimal.fromString('0');
    strategyDayData.harvestsCount = BigInt.fromI32(0);
    strategyDayData.startDayTvl = BigDecimal.fromString('0');
    strategyDayData.dailyAPR = BigDecimal.fromString('0');
    strategyDayData.yearlyAPY = BigDecimal.fromString('0');
    strategyDayData.yearlyCompaundAPY = BigDecimal.fromString('0');
    strategyDayData.dailyAPRRaw = BigInt.fromI32(0);
    strategyDayData.earnedRaw = BigInt.fromI32(0);
    strategyDayData.tvlRaw = BigInt.fromI32(0);
  }
  if(strategyDayData.startDayTvl == BigDecimal.fromString('0')) {
    strategyDayData.startDayTvl = toDecimal(event.params.tvl);
  }
  strategyDayData.earned = strategyDayData.earned.plus(toDecimal(event.params.wantHarvested));
  strategyDayData.tvl = toDecimal(event.params.tvl);
  strategyDayData.earnedRaw = strategyDayData.earnedRaw.plus(event.params.wantHarvested);
  strategyDayData.tvlRaw = event.params.tvl;
  strategyDayData.dailyAPRRaw = strategyDayData.earnedRaw.times(BigInt.fromI32(100)).div(strategyDayData.tvlRaw);
  strategyDayData.harvestsCount = strategyDayData.harvestsCount.plus(BigInt.fromI32(1));
  strategyDayData.dailyAPR = strategyDayData.earned.times(BigDecimal.fromString('100')).div(strategyDayData.tvl)
  strategyDayData.yearlyAPY = strategyDayData.dailyAPR.times(BigDecimal.fromString('365'))
  // let yearlyHarvestCount = strategyDayData.harvestsCount.times(BigInt.fromI32(365))
  // let numberCount = toDecimal(yearlyHarvestCount)

 
  let divYearlyApy = strategyDayData.yearlyAPY.div(BigDecimal.fromString('100'));
  let indexForAutoComaundAPY = divYearlyApy.div(BigDecimal.fromString('1460'))
  indexForAutoComaundAPY = indexForAutoComaundAPY.plus(BigDecimal.fromString('1'))
  let powAPR = pow(indexForAutoComaundAPY, 1460)
  powAPR = powAPR.minus(BigDecimal.fromString('1'))
  powAPR = powAPR.times(BigDecimal.fromString('100'))
  
  // let step1 = strategyDayData.dailyAPRRaw.div(BigInt.fromI32(100))
  // let step2 = step1.div(BigInt.fromI32(1460))

 

  // let percent = pow(resultDailyAPR, 1460)
  // let res = percentRaw.div(numberCount)
  // for (let i = 2; i <= 1460; i++) {
  //   res = res.times(base);
  // }
  strategyDayData.yearlyCompaundAPY = powAPR
  // strategyDayData.yearlyCompaundAPY = BigDecimal.fromString('1').plus(strategyDayData.dailyAPR.div(toDecimal(strategyDayData.harvestsCount).times(BigDecimal.fromString('365'))))
  // strategyDayData.earnedPercent = 0;
  strategyDayData.save()

  return strategyDayData as StrategyDayData
}

export function updateStrategyData(event: StratHarvest): StrategyData {
  // let timestamp = event.block.timestamp.toI32()
  // let dayID = timestamp / 86400
  // let dayStartTimestamp = dayID * 86400
  let strategyData = StrategyData.load(event.address.toHexString())
  if (strategyData === null) {
    strategyData = new StrategyData(event.address.toHexString())
    strategyData.totalEarned = BigDecimal.fromString('0');
    strategyData.tvl = BigDecimal.fromString('0');
    strategyData.totalHarvestsCount = BigInt.fromI32(0);
  }

  strategyData.totalEarned = strategyData.totalEarned.plus(toDecimal(event.params.wantHarvested));
  strategyData.tvl = toDecimal(event.params.tvl);
  strategyData.totalHarvestsCount = strategyData.totalHarvestsCount.plus(BigInt.fromI32(1));
  // strategyDayData.earnedPercent = 0;
  strategyData.save()

  return strategyData as StrategyData
}

export function updateFeesData(event: TombFees): FeesData {
  // let timestamp = event.block.timestamp.toI32()
  // let dayID = timestamp / 86400
  // let dayStartTimestamp = dayID * 86400
  let feesData = FeesData.load(event.address.toHexString().concat('-').concat('fees'))
  if (feesData === null) {
    feesData = new FeesData(event.address.toHexString().concat('-').concat('fees'))
    feesData.totalFees = BigDecimal.fromString('0');
    feesData.lastPaidFeesAmount = BigDecimal.fromString('0');
    feesData.lastPaidFeesDate = BigInt.fromI32(0);
    feesData.feesCount = BigInt.fromI32(0);
  }

  // feesData.totalFees = feesData.totalFees.plus(toDecimal(event.params.feesAmount));
  // feesData.lastPaidFeesAmount = toDecimal(event.params.feesAmount);
  // feesData.lastPaidFeesDate = event.block.timestamp;
  // feesData.feesCount = feesData.feesCount.plus(BigInt.fromI32(1));
  // strategyDayData.earnedPercent = 0;
  feesData.save()

  return feesData as FeesData
}

