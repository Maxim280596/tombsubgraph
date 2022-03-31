/* eslint-disable prefer-const */
import { BigInt, BigDecimal} from '@graphprotocol/graph-ts'
import { toDecimal } from './helpers';
import {StratHarvest, TombFees} from "../generated/StrategyCommonChefLPProxy/StrategyCommonChefLPProxy";
import { StrategyDayData, StrategyData, FeesData, VaultData } from "../generated/schema";


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
    strategyDayData.harvestsCountCurrentDay = BigDecimal.fromString('0');
    strategyDayData.prognosisHarvestCountPerYear = BigDecimal.fromString('0');
    strategyDayData.startDayTvl = BigDecimal.fromString('0');
    strategyDayData.dailyAPRCurrentDay = BigDecimal.fromString('0');
    strategyDayData.yearlyAPRCurrentDay = BigDecimal.fromString('0');
    strategyDayData.yearlyCompaundAPRCurrentDay = BigDecimal.fromString('0');
  }

  if(strategyDayData.startDayTvl == BigDecimal.fromString('0')) {
    strategyDayData.startDayTvl = toDecimal(event.params.tvl);
  }
  
  strategyDayData.earned = strategyDayData.earned.plus(toDecimal(event.params.wantHarvested));
  strategyDayData.tvl = toDecimal(event.params.tvl);
  strategyDayData.harvestsCountCurrentDay = strategyDayData.harvestsCountCurrentDay.plus(BigDecimal.fromString('1'));
  let harvestsPerYear = strategyDayData.harvestsCountCurrentDay.times(BigDecimal.fromString('365'))
  strategyDayData.prognosisHarvestCountPerYear = harvestsPerYear;

  if(strategyDayData.tvl > BigDecimal.fromString("0") && strategyDayData.earned > BigDecimal.fromString("0")) {
    strategyDayData.dailyAPRCurrentDay = strategyDayData.earned.times(BigDecimal.fromString('100')).div(strategyDayData.tvl)
    strategyDayData.yearlyAPRCurrentDay = strategyDayData.dailyAPRCurrentDay.times(BigDecimal.fromString('365'))

    let divYearlyApy = strategyDayData.yearlyAPRCurrentDay.div(BigDecimal.fromString('100'))
    let indexForAutoComaundAPY = divYearlyApy.div(strategyDayData.prognosisHarvestCountPerYear)
    indexForAutoComaundAPY = indexForAutoComaundAPY.plus(BigDecimal.fromString('1'))
    let powAPR = pow(indexForAutoComaundAPY, 1460)
    powAPR = powAPR.minus(BigDecimal.fromString('1'))
    powAPR = powAPR.times(BigDecimal.fromString('100'))

    strategyDayData.yearlyCompaundAPRCurrentDay = powAPR
  }
  
  
  

  strategyDayData.save()

  return strategyDayData as StrategyDayData

}

export function updateStrategyData(event: StratHarvest): StrategyData {
  let strategyData = StrategyData.load(event.address.toHexString())
  if (strategyData === null) {
    strategyData = new StrategyData(event.address.toHexString())
    strategyData.totalEarned = BigDecimal.fromString('0');
    strategyData.tvl = BigDecimal.fromString('0');
    strategyData.totalHarvestsCount = BigDecimal.fromString("0")
    strategyData.harvestCountPerDay = BigDecimal.fromString("0")
    strategyData.harvestCountPerYear = BigDecimal.fromString("0")
    strategyData.daysCounter = BigDecimal.fromString("0");
    strategyData.dailyAPR = BigDecimal.fromString("0")
    strategyData.createStrategyDataDate = event.block.timestamp
    strategyData.lastHarvestDate = event.block.timestamp
  }

  strategyData.totalEarned = strategyData.totalEarned.plus(toDecimal(event.params.wantHarvested));
  strategyData.tvl = toDecimal(event.params.tvl);
  strategyData.totalHarvestsCount = strategyData.totalHarvestsCount.plus(BigDecimal.fromString("1"));
  let dayStartTimestamp = strategyData.createStrategyDataDate.toI32();
  let dayIdCreateStrategyData = dayStartTimestamp/86400;
  let lastHarvestTimestamp = strategyData.lastHarvestDate.toI32();
  let dayIdLastHarvest = (lastHarvestTimestamp/86400) + 1;
  let daysCount = (dayIdLastHarvest - dayIdCreateStrategyData);
  strategyData.daysCounter = BigDecimal.fromString(daysCount.toString())
  let harvestCountPerDay = strategyData.totalHarvestsCount.div(strategyData.daysCounter);
  strategyData.harvestCountPerDay = harvestCountPerDay
  let harvestsPerYear = strategyData.harvestCountPerDay.times(BigDecimal.fromString("365"));
  strategyData.harvestCountPerYear = harvestsPerYear

  if(strategyData.tvl > BigDecimal.fromString("0") && strategyData.totalEarned > BigDecimal.fromString("0")) {
    let currentAPR = strategyData.totalEarned.times(BigDecimal.fromString('100')).div(strategyData.tvl)
    if(strategyData.daysCounter > BigDecimal.fromString("0")) {
      strategyData.dailyAPR = currentAPR.div(strategyData.daysCounter)
    } else {
      strategyData.dailyAPR = currentAPR
    }
    strategyData.yearlyAPR = strategyData.dailyAPR.times(BigDecimal.fromString('365'))

  let divYearlyApy = strategyData.yearlyAPR.div(BigDecimal.fromString('100'))
  let indexForAutoComaundAPY = divYearlyApy.div(strategyData.harvestCountPerYear)
  indexForAutoComaundAPY = indexForAutoComaundAPY.plus(BigDecimal.fromString('1'))
  let powAPR = pow(indexForAutoComaundAPY, 1460)
  powAPR = powAPR.minus(BigDecimal.fromString('1'))
  powAPR = powAPR.times(BigDecimal.fromString('100'))

  strategyData.yearlyCompaundAPR = powAPR
  }
 
  strategyData.save()

  return strategyData as StrategyData 
 
}

export function updateFeesData(event: TombFees): FeesData {
  let feesData = FeesData.load(event.address.toHexString().concat('-').concat('fees'))
  if (feesData === null) {
    feesData = new FeesData(event.address.toHexString().concat('-').concat('fees'))
    feesData.totalFees = BigDecimal.fromString('0');
    feesData.lastPaidFeesAmount = BigDecimal.fromString('0');
    feesData.lastPaidFeesDate = BigInt.fromI32(0);
    feesData.feesCount = BigInt.fromI32(0);
  }

  feesData.totalFees = feesData.totalFees.plus(toDecimal(event.params.feesAmount));
  feesData.lastPaidFeesAmount = toDecimal(event.params.feesAmount);
  feesData.lastPaidFeesDate = event.block.timestamp;
  feesData.feesCount = feesData.feesCount.plus(BigInt.fromI32(1));

  feesData.save()

  return feesData as FeesData
}

