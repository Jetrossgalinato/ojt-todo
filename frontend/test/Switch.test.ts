import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { defineComponent, ref } from "vue"
import Switch from "../app/components/ui/switch/Switch.vue"

describe("Switch", () => {
  it("updates v-model:checked when the button is clicked", async () => {
    const Host = defineComponent({
      components: { Switch },
      setup() {
        const checked = ref(false)
        return { checked }
      },
      template: `<Switch v-model:checked="checked" />`,
    })

    const wrapper = mount(Host)
    const btn = wrapper.get('button[role="switch"]')

    expect(btn.attributes("data-state")).toBe("unchecked")

    await btn.trigger("click")
    expect(wrapper.vm.checked).toBe(true)
    expect(btn.attributes("data-state")).toBe("checked")

    await btn.trigger("click")
    expect(wrapper.vm.checked).toBe(false)
    expect(btn.attributes("data-state")).toBe("unchecked")
  })

  it("reflects an externally set checked value", async () => {
    const Host = defineComponent({
      components: { Switch },
      setup() {
        const checked = ref(true)
        return { checked }
      },
      template: `<Switch v-model:checked="checked" />`,
    })

    const wrapper = mount(Host)
    expect(wrapper.get('button[role="switch"]').attributes("data-state")).toBe("checked")

    wrapper.vm.checked = false
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button[role="switch"]').attributes("data-state")).toBe("unchecked")
  })
})
