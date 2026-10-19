/*
 * BusinessCalc.ca - shared application logic.
 * Pure calculator functions are kept separate from the DOM code so they can
 * be unit tested in Node (see the module export guard at the bottom).
 * All calculations run in the browser; no input values are sent anywhere.
 */
(function (global) {
  "use strict";

  /* ---------- formatting & parsing ---------- */

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function groupThousands(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function fmtMoney(n) {
    if (typeof n !== "number" || !isFinite(n)) n = 0;
    var v = round2(n);
    if (v === 0) v = 0; /* avoids -0.00 */
    var neg = v < 0;
    var parts = Math.abs(v).toFixed(2).split(".");
    return (neg ? "-$" : "$") + groupThousands(parts[0]) + "." + parts[1];
  }

  function fmtNum(n, decimals) {
    if (typeof n !== "number" || !isFinite(n)) n = 0;
    if (decimals == null) decimals = 2;
    var parts = n.toFixed(decimals).split(".");
    var sign = "";
    if (parts[0].charAt(0) === "-") { sign = "-"; parts[0] = parts[0].slice(1); }
    return sign + groupThousands(parts[0]) + (decimals > 0 ? "." + parts[1] : "");
  }

  function fmtInt(n) {
    if (typeof n !== "number" || !isFinite(n)) n = 0;
    return fmtNum(Math.round(n), 0);
  }

  function fmtPct(n, decimals) {
    if (typeof n !== "number" || !isFinite(n)) n = 0;
    if (decimals == null) decimals = 1;
    return n.toFixed(decimals) + "%";
  }

  /* Safe parse: strips $, %, commas and spaces. Returns NaN when unusable. */
  function parseNum(v) {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    var s = String(v).replace(/[$,%\s,]/g, "");
    if (s === "" || s === "-" || s === ".") return NaN;
    var n = Number(s);
    return isNaN(n) ? NaN : n;
  }

  function numOr(v, dft) {
    var n = parseNum(v);
    return isNaN(n) ? (dft || 0) : n;
  }

  /* ---------- pure calculators ---------- */

  function calcRevenue(o) {
    var salesRevenue = o.price * o.sales;
    var totalRevenue = salesRevenue + o.other;
    var avgPerSale = o.sales > 0 ? salesRevenue / o.sales : 0;
    return { salesRevenue: salesRevenue, otherRevenue: o.other, totalRevenue: totalRevenue, avgPerSale: avgPerSale };
  }

  function calcProfit(o) {
    var totalCost = o.product + o.shipping + o.advertising + o.fees + o.other;
    var profit = o.price - totalCost;
    var margin = o.price > 0 ? (profit / o.price) * 100 : 0;
    var requiredSales = null;
    if (o.target != null && o.target > 0 && profit > 0) requiredSales = Math.ceil(o.target / profit);
    return { totalCost: totalCost, profit: profit, margin: margin, requiredSales: requiredSales };
  }

  function calcMargin(o) {
    var profit = o.revenue - o.cost;
    var margin = o.revenue > 0 ? (profit / o.revenue) * 100 : 0;
    return { profit: profit, margin: margin };
  }

  function calcMarkupFromPrice(o) {
    var markupDollars = o.price - o.cost;
    var markupPct = o.cost > 0 ? (markupDollars / o.cost) * 100 : 0;
    var marginPct = o.price > 0 ? (markupDollars / o.price) * 100 : 0;
    return { markupDollars: markupDollars, markupPct: markupPct, marginPct: marginPct };
  }

  function calcPriceFromMarkup(o) {
    var price = o.cost * (1 + o.markupPct / 100);
    var markupDollars = price - o.cost;
    var marginPct = price > 0 ? (markupDollars / price) * 100 : 0;
    return { price: price, markupDollars: markupDollars, marginPct: marginPct };
  }

  function calcBreakEven(o) {
    var contribution = o.price - o.variable;
    var units = null, revenue = null;
    if (contribution > 0) {
      units = Math.ceil(o.fixed / contribution);
      revenue = units * o.price;
    }
    return { contribution: contribution, units: units, breakEvenRevenue: revenue };
  }

  function calcEmployeeCost(o) {
    var base = o.mode === "salary" ? o.salary : o.wage * o.hours * o.weeks;
    var payrollCost = base * (o.payrollPct / 100);
    var vacation = base * (o.vacationPct / 100);
    var additional = payrollCost + vacation + o.benefits + o.bonuses + o.other;
    var total = base + additional;
    var hoursTotal = o.hours * o.weeks;
    return {
      base: base, payrollCost: payrollCost, vacation: vacation,
      additionalCosts: additional, total: total,
      monthly: total / 12,
      effectiveHourly: hoursTotal > 0 ? total / hoursTotal : 0
    };
  }

  function calcHourlyRate(o) {
    var billableHours = o.weeks * o.billablePerWeek;
    var minimumRate = billableHours > 0 ? (o.income + o.expenses) / billableHours : 0;
    var recommendedRate = minimumRate * (1 + o.bufferPct / 100);
    var annualTarget = recommendedRate * billableHours;
    return {
      billableHours: billableHours, minimumRate: minimumRate,
      recommendedRate: recommendedRate, annualTarget: annualTarget,
      monthlyTarget: annualTarget / 12,
      weeklyTarget: o.weeks > 0 ? annualTarget / o.weeks : 0
    };
  }

  function calcPricing(o) {
    var totalCost = o.costs.reduce(function (a, b) { return a + b; }, 0);
    var valid = o.marginPct < 100;
    var suggestedPrice = valid ? totalCost / (1 - o.marginPct / 100) : null;
    return {
      totalCost: totalCost, minimumPrice: totalCost,
      suggestedPrice: suggestedPrice,
      profitPerSale: suggestedPrice != null ? suggestedPrice - totalCost : null,
      marginPct: o.marginPct
    };
  }

  function calcLoan(o) {
    var P = o.amount, n = Math.round(o.years * o.perYear), r = (o.annualRatePct / 100) / o.perYear;
    if (!(P > 0) || !(n > 0)) {
      return { payment: 0, totalInterest: 0, totalRepayment: 0, schedule: [], annual: [] };
    }
    var pmt;
    if (r === 0) { pmt = P / n; }
    else { var f = Math.pow(1 + r, n); pmt = (P * r * f) / (f - 1); }
    pmt = round2(pmt);
    var bal = P, totalInterest = 0, schedule = [], annual = [], byYear = {};
    for (var i = 1; i <= n; i++) {
      var interest = round2(bal * r);
      var principal = round2(pmt - interest);
      if (principal > bal || i === n) principal = bal;
      var pay = round2(principal + interest);
      bal = round2(bal - principal);
      totalInterest = round2(totalInterest + interest);
      schedule.push({ n: i, payment: pay, principal: principal, interest: interest, balance: bal });
      var yr = Math.ceil(i / o.perYear);
      if (!byYear[yr]) { byYear[yr] = { year: yr, payments: 0, principal: 0, interest: 0, balance: bal }; annual.push(byYear[yr]); }
      byYear[yr].payments += 1;
      byYear[yr].principal = round2(byYear[yr].principal + principal);
      byYear[yr].interest = round2(byYear[yr].interest + interest);
      byYear[yr].balance = bal;
    }
    return { payment: pmt, totalInterest: totalInterest, totalRepayment: round2(P + totalInterest), schedule: schedule, annual: annual };
  }

  function calcInventory(o) {
    var sold = Math.min(Math.max(o.sold, 0), o.units);
    var investment = o.units * o.costPerUnit;
    var revenue = sold * o.price;
    var cogsSold = sold * o.costPerUnit;
    var grossProfit = revenue - cogsSold;
    var totalCost = investment + o.freight + o.advertising + o.fees + o.other;
    var netProfit = revenue - totalCost;
    return {
      investment: investment, revenue: revenue, cogsSold: cogsSold,
      grossProfit: grossProfit, totalCost: totalCost, netProfit: netProfit,
      margin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      roi: totalCost > 0 ? (netProfit / totalCost) * 100 : 0,
      unsoldUnits: o.units - sold,
      unsoldValue: (o.units - sold) * o.costPerUnit
    };
  }

  function calcEtsy(o) {
    var revenue = o.price + o.shippingCharged;
    var transactionFee = revenue * (o.transactionPct / 100);
    var processingFee = revenue * (o.processingPct / 100) + o.processingFlat;
    var totalFees = o.listingFee + transactionFee + processingFee;
    /* Advertising is a real per-order cost, so it is counted with the other
       costs even though it is not a platform fee. */
    var totalCosts = o.productCost + o.actualShipping + totalFees + o.advertising + o.other;
    var profit = revenue - totalCosts;
    return {
      revenue: revenue, transactionFee: transactionFee, processingFee: processingFee,
      totalFees: totalFees, totalCosts: totalCosts, profit: profit,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      at10: profit * 10, at50: profit * 50, at100: profit * 100
    };
  }

  function calcShopify(o) {
    var processingFee = o.price * (o.processingPct / 100) + o.processingFlat;
    var totalCost = o.product + o.shipping + o.advertising + o.shopifyFees +
      processingFee + o.apps + o.refund + o.other;
    var profit = o.price - totalCost;
    var denom = o.price - (totalCost - o.advertising);
    var requiredSales = null;
    if (o.target != null && o.target > 0 && profit > 0) requiredSales = Math.ceil(o.target / profit);
    return {
      processingFee: processingFee, totalCost: totalCost, profit: profit,
      margin: o.price > 0 ? (profit / o.price) * 100 : 0,
      roas: o.advertising > 0 ? o.price / o.advertising : null,
      breakEvenRoas: denom > 0 ? o.price / denom : null,
      requiredSales: requiredSales
    };
  }

  function calcTaxCustom(o) {
    if (o.mode === "extract") {
      var base = o.amount / (1 + o.ratePct / 100);
      return { base: base, tax: o.amount - base, total: o.amount };
    }
    var tax = o.amount * (o.ratePct / 100);
    return { base: o.amount, tax: tax, total: o.amount + tax };
  }

  function calcTaxCanada(o) {
    var table = o.table || (typeof CONFIG !== "undefined" ? CONFIG.taxTable : null);
    if (!table || !table[o.province]) return null;
    var prov = table[o.province];
    var combined = prov.lines.reduce(function (a, l) { return a + l.rate; }, 0);
    var base = o.mode === "extract" ? o.amount / (1 + combined / 100) : o.amount;
    var lines = prov.lines.map(function (l) {
      return { label: l.label, rate: l.rate, amount: base * (l.rate / 100) };
    });
    var taxTotal = lines.reduce(function (a, l) { return a + l.amount; }, 0);
    return {
      province: prov.name, base: base, lines: lines,
      taxTotal: o.mode === "extract" ? o.amount - base : taxTotal,
      total: o.mode === "extract" ? o.amount : round2(base + taxTotal)
    };
  }

  /* ---------- search ---------- */

  function searchCalculators(query, config) {
    var cfg = config || (typeof CONFIG !== "undefined" ? CONFIG : null);
    if (!cfg || !query) return [];
    var q = String(query).toLowerCase().trim();
    if (!q) return [];
    var tokens = q.split(/\s+/);
    var scored = cfg.calculators.map(function (c, idx) {
      var name = c.name.toLowerCase();
      var kw = (c.keywords || "").toLowerCase();
      var desc = (c.description || "").toLowerCase();
      var score = 0;
      if (name.indexOf(q) !== -1) score += 1000;
      tokens.forEach(function (t) {
        if (!t) return;
        if (name.indexOf(t) !== -1) score += 300;
        if (kw.split(/\s+/).indexOf(t) !== -1) score += 200;
        else if (kw.indexOf(t) !== -1) score += 60;
        if (desc.indexOf(t) !== -1) score += 40;
      });
      return { calc: c, score: score, idx: idx };
    }).filter(function (s) { return s.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score || a.idx - b.idx; });
    return scored.map(function (s) { return s.calc; });
  }

  var BC = {
    round2: round2, fmtMoney: fmtMoney, fmtNum: fmtNum, fmtInt: fmtInt,
    fmtPct: fmtPct, parseNum: parseNum, numOr: numOr,
    calcRevenue: calcRevenue, calcProfit: calcProfit, calcMargin: calcMargin,
    calcMarkupFromPrice: calcMarkupFromPrice, calcPriceFromMarkup: calcPriceFromMarkup,
    calcBreakEven: calcBreakEven, calcEmployeeCost: calcEmployeeCost,
    calcHourlyRate: calcHourlyRate, calcPricing: calcPricing, calcLoan: calcLoan,
    calcInventory: calcInventory, calcEtsy: calcEtsy, calcShopify: calcShopify,
    calcTaxCustom: calcTaxCustom, calcTaxCanada: calcTaxCanada,
    searchCalculators: searchCalculators,
    track: function (eventName) {
      /* Analytics stub: only forwards an event NAME (never input values)
         when a dataLayer already exists on the page. */
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({ event: eventName });
      }
    }
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = BC; }
  global.BC = BC;

  /* ---------- browser-only code below ---------- */
  if (typeof document === "undefined") return;

  function $(id) { return document.getElementById(id); }

  function getVal(id) {
    var el = $(id);
    return el ? BC.numOr(el.value, 0) : 0;
  }
  BC.getVal = getVal;

  BC.setText = function (id, txt) {
    var el = $(id);
    if (el) el.textContent = txt;
  };

  BC.setHTML = function (id, html) {
    var el = $(id);
    if (el) el.innerHTML = html;
  };

  /* Bind a render function to every input inside a form container. */
  BC.bindLive = function (containerId, render) {
    var box = $(containerId);
    var run = function () { try { render(); } catch (e) { /* never break the page */ } };
    if (box) {
      box.addEventListener("input", run);
      box.addEventListener("change", run);
    }
    run();
    return run;
  };

  BC.resetForm = function (containerId) {
    var box = $(containerId);
    if (!box) return;
    var fields = box.querySelectorAll("input, select");
    fields.forEach(function (f) {
      if (f.dataset && f.dataset.default != null) f.value = f.dataset.default;
      else if (f.tagName === "INPUT") f.value = "";
    });
    box.dispatchEvent(new Event("input", { bubbles: true }));
  };

  BC.copyText = function (text, btn) {
    function done() {
      if (btn) {
        var old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = old; }, 1600);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(ta);
      done();
    }
  };

  function initHeader() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    /* Search overlay */
    var overlay = $("search-overlay");
    var input = $("search-input");
    var results = $("search-results");
    function renderSearch() {
      if (!input || !results) return;
      var found = BC.searchCalculators(input.value);
      if (!input.value.trim()) {
        results.innerHTML = '<p class="search-hint">Start typing, for example "shopify", "tax" or "employee".</p>';
        return;
      }
      if (!found.length) {
        results.innerHTML = '<p class="search-hint">No calculators match that search yet. Try "profit", "pricing" or "loan".</p>';
        return;
      }
      results.innerHTML = found.map(function (c) {
        return '<a class="search-result" href="/' + c.slug + '/"><strong>' + c.name +
          '</strong><span>' + c.description + "</span></a>";
      }).join("");
    }
    function openSearch(prefill) {
      if (!overlay) return;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      if (prefill != null && input) input.value = prefill;
      renderSearch();
      if (input) input.focus();
    }
    function closeSearch() {
      if (!overlay) return;
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    document.querySelectorAll("[data-open-search]").forEach(function (b) {
      b.addEventListener("click", function () { openSearch(null); });
    });
    var closeBtn = $("search-close");
    if (closeBtn) closeBtn.addEventListener("click", closeSearch);
    if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSearch(); });
    if (input) input.addEventListener("input", renderSearch);
    /* Any search form (hero bar) opens the overlay with the query. */
    document.querySelectorAll("form[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var field = form.querySelector("input");
        openSearch(field ? field.value : "");
      });
    });
  }

  function initFaq() {
    /* Accordion behaviour: opening one FAQ closes the others in its group. */
    document.querySelectorAll(".faq-list").forEach(function (list) {
      var items = list.querySelectorAll("details.faq-item");
      items.forEach(function (item) {
        item.addEventListener("toggle", function () {
          if (item.open) {
            items.forEach(function (other) { if (other !== item) other.open = false; });
          }
        });
      });
    });
  }

  function initForms() {
    /* Lead magnet + contact forms. Endpoints come from config.js. When an
       endpoint is empty the form is not open yet, and we say so honestly. */
    document.querySelectorAll("form[data-endpoint-key]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var key = form.getAttribute("data-endpoint-key");
        var endpoint = (typeof CONFIG !== "undefined" && CONFIG[key]) || "";
        var note = form.querySelector(".form-note");
        if (!endpoint) {
          if (note) note.textContent = "This form is not open yet. The calculators above are fully working, and this signup will open soon.";
          return;
        }
        var data = new FormData(form);
        fetch(endpoint, { method: "POST", body: data })
          .then(function () { if (note) note.textContent = "Thanks, your request was sent."; form.reset(); })
          .catch(function () { if (note) note.textContent = "Something went wrong sending that. Please try again in a moment."; });
        BC.track(key === "leadFormEndpoint" ? "email_signup" : "contact_submit");
      });
    });
  }

  BC.syncSegmented = function () {
    document.querySelectorAll("[data-seg]").forEach(function (group) {
      var hidden = document.getElementById(group.getAttribute("data-seg"));
      if (!hidden) return;
      group.querySelectorAll("button[data-value]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-value") === hidden.value);
      });
    });
  };

  function initSegmented() {
    document.querySelectorAll("[data-seg]").forEach(function (group) {
      var hidden = document.getElementById(group.getAttribute("data-seg"));
      if (!hidden) return;
      group.querySelectorAll("button[data-value]").forEach(function (b) {
        b.addEventListener("click", function () {
          hidden.value = b.getAttribute("data-value");
          BC.syncSegmented();
          hidden.dispatchEvent(new Event("input", { bubbles: true }));
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    });
    BC.syncSegmented();
  }

  function initCalcPage() {
    initSegmented();
    var slug = document.body.getAttribute("data-calculator");
    if (slug) BC.track("calculator_view");
    if (typeof window.__calcInit === "function") window.__calcInit();
    document.querySelectorAll("[data-copy-summary]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof window.__getSummary === "function") BC.copyText(window.__getSummary(), btn);
      });
    });
    document.querySelectorAll("[data-share-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        BC.copyText(window.location.href, btn);
        BC.track("share_calculator");
      });
    });
    document.querySelectorAll("[data-print]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.print(); });
    });
    document.querySelectorAll("[data-related-link]").forEach(function (a) {
      a.addEventListener("click", function () { BC.track("related_calculator_clicked"); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initFaq();
    initForms();
    initCalcPage();
  });
})(typeof window !== "undefined" ? window : globalThis);
