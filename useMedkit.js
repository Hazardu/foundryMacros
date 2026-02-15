const CONFIG_MACRO = {
  actorName: game.user.name,
  skillName: "medicae",
  specName: "Human",
  characteristicBonusKey: "tgh", // ws, bs, str, tgh, ag, int, per, wil, fel 
  actionTitle: "Leczenie polowe",
  consumableItemName: "Medykamenty" //opcjonalne pole nazwy przedmiotu który ma być zużyty
};

const resultHtml = function(username, targetActorName, woundsHealed, successLevels, targetCharBonus) {
  const html = `
    <h5>Leczenie</h5>
    <p><i class="fas fa-user-nurse"></i> ${username} leczy <strong>${targetActorName}</strong> i udaje mu się uleczyć <strong>${woundsHealed}</strong> ran.</p>
    <p>(SL: ${successLevels} + TB: ${targetCharBonus})</p>
  `;

  return html;
}

// =============== WYBIERZ BONUS TARGETU ============= //

const targetToken = Array.from(game.user.targets)[0];
if (!targetToken) return ui.notifications.info("Najpierw wybierz target (T).");

const targetActor = targetToken.actor;
const targetActorName = targetActor.name;
const targetCharBonus = targetActor?.system?.characteristics?.[CONFIG_MACRO.characteristicBonusKey]?.bonus;
if (targetCharBonus == null) return ui.notifications.info("Target nie ma tego characteristic bonus.");

// ============== WYBIERANIE AKTORA ================= //

const user = game.actors.find(a => a.name === CONFIG_MACRO.actorName);

// ============== SPRAWDZANIE PRZEDMIOTU CONSUMABLE ============= //

let consumableItem = null;
if(CONFIG_MACRO.consumableItemName)
    {
  consumableItem = user.items.find(item=>item.name === CONFIG_MACRO.consumableItemName);
  const consumableCount = consumableItem?.system.quantity;

  // kontynuuj wtw gdy przedmiot istnieje w eq i qty > 0
  if(!consumableItem || consumableCount <= 0)
  {
    return ui.notifications.error("Nie posiadasz wymaganych przedmiotów: " + CONFIG_MACRO.consumableItemName)
  }

}

//  ========== WYBIERANIE SKILLA / SPECJALIZACJI ============== //

const specId = user.system.skills?.[CONFIG_MACRO.skillName].specialisations.find(s=>s.name === CONFIG_MACRO.specName)?.id; // zaciąganie specjalizacji
const showSpecialization = specId ? true : false;

// =============== OBSŁUŻ TARGETY PRZED TESTEM ====================== //

const previousTargetIds = Array.from(game.user.targets).map(t => t.id);

try {
  // odtargetuj wszystko
  for (const t of Array.from(game.user.targets)) {
    await t.setTarget(false, { releaseOthers: false });
  }

  user.clearOpposed?.();
  user.clearAction?.();

// =============== WYKONAJ TEST NA SPECJALIZACJĘ / Skill ==================== //

  const skillNameUppercase = String(CONFIG_MACRO.skillName).charAt(0).toUpperCase() + String(CONFIG_MACRO.skillName).slice(1);
  const message = { title: showSpecialization ? CONFIG_MACRO.actionTitle + " " + skillNameUppercase + " (" + CONFIG_MACRO.specName + ")" : CONFIG_MACRO.actionTitle + " " + skillNameUppercase };
  
  const test = await user.setupSkillTest({key: CONFIG_MACRO.skillName, name: CONFIG_MACRO.specName}, message);

  const successLevels = test?.result?.SL ?? 0;
  const resultValue = successLevels + targetCharBonus;

  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: user }),
    content: resultHtml(user.name, targetActorName, resultValue, successLevels, targetCharBonus)
  });

  // zużyj przedmiot jeśli wszystko zadziałało -> qty - 1 
  if(consumableItem)
  {
    // wklej przedmiot na czat
    // consumableItem?.system.use();
    consumableItem.system.quantity = consumableItem.system.quantity - 1;
  }



} finally {
  // przywróć targety
  for (const tokenId of previousTargetIds) {
    const tok = canvas.tokens?.get(tokenId);
    if (tok) await tok.setTarget(true, { releaseOthers: false });
  }

}
