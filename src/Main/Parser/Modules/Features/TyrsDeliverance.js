import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, TYRS_DELIVERANCE_HEAL_SPELL_ID } from 'Main/Parser/Constants';

export const TYRS_MUNIFICENCE_TRAIT_ID = 238060;
const TYRS_DELIVERANCE_BUFF_SPELL_ID = TYRS_DELIVERANCE_HEAL_SPELL_ID;
const TYRS_DELIVERANCE_BASE_HEALING_INCREASE = 0.2;
const TYRS_MUNIFICENCE_POINT_HEALING_INCREASE = 0.05;

class TyrsDeliverance extends Module {
  healHealing = 0;
  buffFoLHLHealing = 0;

  tyrsMunificenceTraits = null;
  on_initialized() {
    this.tyrsMunificenceTraits = this.owner.selectedCombatant.traitsBySpellId[TYRS_MUNIFICENCE_TRAIT_ID] || 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    switch (spellId) {
      case TYRS_DELIVERANCE_HEAL_SPELL_ID:
        this.healHealing += event.amount + (event.absorbed || 0);
        break;
      case FLASH_OF_LIGHT_SPELL_ID:
      case HOLY_LIGHT_SPELL_ID: {
        if (!this.owner.modules.buffs.hasBuff(TYRS_DELIVERANCE_BUFF_SPELL_ID)) {
          break;
        }
        const totalHealingIncrease = TYRS_DELIVERANCE_BASE_HEALING_INCREASE + this.tyrsMunificenceTraits * TYRS_MUNIFICENCE_POINT_HEALING_INCREASE;

        const amount = event.amount;
        const absorbed = event.absorbed || 0;
        const overheal = event.overheal || 0;
        const raw = amount + absorbed + overheal;
        const healingIncreaseFactor = 1 + totalHealingIncrease;
        const healingIncrease = raw - raw / healingIncreaseFactor;

        const effectiveHealing = Math.max(0, healingIncrease - overheal);

        this.buffFoLHLHealing += effectiveHealing;
        break;
      }
      default: break;
    }
  }
}

export default TyrsDeliverance;