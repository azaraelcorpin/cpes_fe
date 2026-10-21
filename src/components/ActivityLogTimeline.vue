<template>
  <div class="activity-log-timeline">
    <div v-if="!submissionRounds.length" class="text-center text-grey-6 q-pa-xl">
      No activity log available.
    </div>

    <q-card
      v-for="round in submissionRounds"
      :key="round.number"
      flat
      bordered
      class="activity-round-card q-mb-md"
      :class="{ 'activity-round-card--reverted': round.reverted }"
    >
      <q-card-section class="activity-round-heading row items-center">
        <div class="text-subtitle1 text-weight-bold text-grey-9">
          Submission Round {{ round.number }}
        </div>
        <q-space />
        <div v-if="round.reverted" class="activity-round-reverted-label">
          [ 🔴 Reverted to Draft ]
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section class="activity-round-body">
        <div
          v-for="(item, index) in round.items"
          :key="item._id || `${round.number}-${item.status}-${index}`"
          class="activity-timeline-entry"
          :class="{
            'activity-timeline-entry--declined': isDeclined(item),
            'activity-timeline-entry--last': index === round.items.length - 1
          }"
        >
          <div class="activity-timeline-dot" :class="{ 'activity-timeline-dot--declined': isDeclined(item) }">
            <q-icon :name="isDeclined(item) ? 'close' : 'check'" size="14px" color="white" />
          </div>

          <div class="activity-timeline-content">
            <div class="activity-timeline-status">{{ item.status }}</div>
            <div class="activity-timeline-role">{{ item.role || 'Role not recorded' }}</div>
            <div class="activity-timeline-meta">
              <span v-if="item.email">{{ item.email }}</span>
              <span v-if="item.email && item.acted_at" class="activity-timeline-meta-separator">•</span>
              <span v-if="item.acted_at">{{ formatActedAt(item.acted_at) }}</span>
            </div>

            <div v-if="isDeclined(item)" class="activity-decline-callout">
              <q-icon name="edit_note" size="18px" class="q-mr-xs" />
              <span>{{ declineReason(item) }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'ActivityLogTimeline',

  props: {
    logItems: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    submissionRounds () {
      const sortedItems = this.logItems
        .filter(item => item && typeof item === 'object')
        .map((item, index) => ({ ...item, _originalIndex: index }))
        .sort((first, second) => {
          const firstTime = first.acted_at ? new Date(first.acted_at).getTime() : Number.NaN;
          const secondTime = second.acted_at ? new Date(second.acted_at).getTime() : Number.NaN;
          const firstValid = Number.isFinite(firstTime);
          const secondValid = Number.isFinite(secondTime);

          if (!firstValid && !secondValid) return first._originalIndex - second._originalIndex;
          if (!firstValid) return 1;
          if (!secondValid) return -1;
          return firstTime - secondTime || first._originalIndex - second._originalIndex;
        });

      const rounds = [];
      let currentRound = null;

      for (const item of sortedItems) {
        const status = String(item.status || '').trim().toUpperCase();
        if (!status) continue;

        if (!currentRound || (status === 'SUBMITTED' && currentRound.items.length > 0)) {
          currentRound = {
            number: rounds.length + 1,
            reverted: false,
            items: []
          };
          rounds.push(currentRound);
        }

        const normalizedItem = {
          ...item,
          status
        };
        currentRound.items.push(normalizedItem);

        if (status === 'DECLINED') {
          currentRound.reverted = true;
        }
      }

      return rounds;
    }
  },

  methods: {
    isDeclined (item) {
      return String(item?.status || '').trim().toUpperCase() === 'DECLINED';
    },

    declineReason (item) {
      const remarks = String(item?.remarks || '').trim();
      return !remarks || remarks.toUpperCase() === '[NULL]'
        ? 'No rejection reason was provided.'
        : remarks;
    },

    formatActedAt (value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value || '');

      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return `${datePart} • ${timePart}`;
    }
  }
};
</script>

<style scoped>
.activity-round-card {
  border-color: #e2e8f0;
  border-radius: 10px;
}

.activity-round-card--reverted {
  border-color: #d1d5db;
}

.activity-round-heading {
  min-height: 64px;
  padding: 16px 20px;
}

.activity-round-reverted-label {
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 600;
}

.activity-round-body {
  padding: 24px 20px 12px;
}

.activity-timeline-entry {
  position: relative;
  display: flex;
  gap: 16px;
  min-height: 94px;
  padding-bottom: 24px;
}

.activity-timeline-entry:not(.activity-timeline-entry--last)::after,
.activity-timeline-entry--declined::after {
  position: absolute;
  top: 20px;
  bottom: 0;
  left: 9px;
  border-left: 2px solid #10b981;
  content: '';
}

.activity-timeline-entry--declined::after {
  border-left: 2px dashed #cbd5e1;
}

.activity-timeline-entry--declined.activity-timeline-entry--last::after {
  bottom: -8px;
}

.activity-timeline-dot {
  z-index: 1;
  display: flex;
  flex: 0 0 20px;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #059669;
}

.activity-timeline-dot--declined {
  background: #e11d48;
}

.activity-timeline-content {
  min-width: 0;
  padding-bottom: 4px;
}

.activity-timeline-status {
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
}

.activity-timeline-role {
  margin-top: 3px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.activity-timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 0.75rem;
}

.activity-timeline-meta-separator {
  color: #cbd5e1;
}

.activity-decline-callout {
  display: flex;
  align-items: flex-start;
  margin-top: 12px;
  margin-left: 4px;
  padding: 10px 12px;
  border: 1px solid #fecdd3;
  border-radius: 6px;
  background: #fff1f2;
  color: #9f1239;
  font-size: 0.85rem;
  line-height: 1.45;
}

.activity-decline-callout .q-icon {
  flex: 0 0 auto;
}

@media (max-width: 599px) {
  .activity-round-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px;
  }

  .activity-round-body {
    padding: 20px 16px 10px;
  }

  .activity-timeline-entry {
    gap: 12px;
  }

  .activity-timeline-meta {
    flex-direction: column;
    gap: 2px;
  }

  .activity-timeline-meta-separator {
    display: none;
  }
}
</style>
