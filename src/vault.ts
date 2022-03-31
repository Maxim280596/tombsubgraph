/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { toDecimal } from "./helpers";
import { StratHarvest } from "../generated/StrategyCommonChefLPProxy/StrategyCommonChefLPProxy";
import { StrategyData, User, VaultData } from "../generated/schema";
import { Deposit, TombVaultProxy, Withdraw } from "../generated/templates/TombVaultProxy/TombVaultProxy";
import { VAULT_ADDRESS } from './constants';

export function updateVault(event: StratHarvest): VaultData {
  let vault = VaultData.load(VAULT_ADDRESS);

  if (vault === null) {
    vault = new VaultData(VAULT_ADDRESS);
    vault.sharesTotalSupply = BigDecimal.fromString("0");
    vault.tvlUSD = BigDecimal.fromString("0");
    vault.userCount = BigInt.fromI32(0);
    vault.earningPerOneShareCurrentWithCompaunding = BigDecimal.fromString("0");
    vault.earningPerOneShareCurrent = BigDecimal.fromString("0");
    vault.earningPerOneShareAutoCompaundApy = BigDecimal.fromString("0");
    vault.earningPerOneShareYearlyApy = BigDecimal.fromString("0");
  }

  let contract = TombVaultProxy.bind(
    Address.fromString(VAULT_ADDRESS)
  );

  let totalSupply = contract.totalSupply();
  vault.sharesTotalSupply = toDecimal(totalSupply);
  let tvl = contract.balance();
  let tvlInUsd = contract.getConvertedLptoUSD(tvl);
  vault.tvlUSD = toDecimal(tvlInUsd);
  let userCount = contract.userCount();
  vault.userCount = userCount;

  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let strategyData = StrategyData.load(event.address.toHex());

  if (vault.sharesTotalSupply > BigDecimal.fromString("0")) {
    vault.earningPerOneShareCurrentWithCompaunding = vault.tvlUSD
      .times(BigDecimal.fromString("1"))
      .div(vault.sharesTotalSupply);

    if (
      strategyData &&
      strategyData.yearlyCompaundAPR > BigDecimal.fromString("0")
    ) {
      let yearlyCompaundApy = strategyData.yearlyCompaundAPR.plus(
        BigDecimal.fromString("100")
      );
      let tvlAfterCompaund = vault.tvlUSD
        .times(yearlyCompaundApy)
        .div(BigDecimal.fromString("100"));

      vault.earningPerOneShareAutoCompaundApy = tvlAfterCompaund
        .times(BigDecimal.fromString("1"))
        .div(vault.sharesTotalSupply);

      let yearlyApy = strategyData.yearlyAPR.plus(BigDecimal.fromString("100"));
      let tvlAfterYear = vault.tvlUSD
        .times(yearlyApy)
        .div(BigDecimal.fromString("100"));

      vault.earningPerOneShareYearlyApy = tvlAfterYear
        .times(BigDecimal.fromString("1"))
        .div(vault.sharesTotalSupply);

      if (yearlyCompaundApy > yearlyApy) {
        let difference = yearlyCompaundApy.minus(yearlyApy);
        let differenceTvl = vault.tvlUSD
          .times(difference)
          .div(BigDecimal.fromString("100"));
        let tvlForCurrent = vault.tvlUSD.minus(differenceTvl);

        vault.earningPerOneShareCurrent = tvlForCurrent.times(
          BigDecimal.fromString("1").div(vault.sharesTotalSupply)
        );
      } else {
        vault.earningPerOneShareCurrent = vault.tvlUSD
          .times(BigDecimal.fromString("1"))
          .div(vault.sharesTotalSupply);
      }
    }
  }

  vault.save();

  return vault as VaultData;
}

export function updateUser(event: Deposit): User {
  let user = User.load(event.params.user.toHex());

  if (user === null) {
    user = new User(event.params.user.toHex());
    user.wallet = "0x";
    user.stakedUsd = BigDecimal.fromString("0");
    user.sharesAmount = BigDecimal.fromString("0");
  }
  user.wallet = event.params.user.toHex();
  user.stakedUsd = user.stakedUsd.plus(toDecimal(event.params.busdAmount));
  user.sharesAmount = user.sharesAmount.plus(
    toDecimal(event.params.sharesAmount)
  );

  user.save();

  return user as User;
}

export function updateUserWithdraw(event: Withdraw): User {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.wallet = "0x";
    user.stakedUsd = BigDecimal.fromString("0");
    user.sharesAmount = BigDecimal.fromString("0");
  }

  user.wallet = event.params.user.toHex();
  let contract = TombVaultProxy.bind(
    Address.fromString(VAULT_ADDRESS)
  );
  let sharesBalance = contract.balanceOf(event.params.user);
  if (sharesBalance === BigInt.fromI32(0)) {
    user.stakedUsd = BigDecimal.fromString("0");
    user.sharesAmount = toDecimal(sharesBalance);
  }
  let vault = VaultData.load(VAULT_ADDRESS);

  user.sharesAmount = toDecimal(sharesBalance);
  if (vault) {
    user.stakedUsd = user.sharesAmount.times(vault.earningPerOneShareCurrent);
  }

  user.save();

  return user as User;
}
