module Shared::Categories
  
  module ClassMethods
    def category_list_for(selector)
      self.send(selector)
    end

    def humanized_categories_for(selector, opts={})
      items = self.send(selector)
      items.keys.each.inject({}) do |collected, key|
        unless(opts[:except] && opts[:except].include?(items[key]))
          collected[key] = humanized_category_for(selector, items[key])
        end
        collected
      end
    end

    def category_for(selector, name)
      self.send(selector).invert[name]
    end

    def category_symbol_for(selector, identifier)
      self.send(selector)[identifier]
    end

    def humanized_category_for(selector, identifier)
      identifier = self.send(selector)[identifier] if identifier.is_a?(Integer)
      I18n.t("app.categories.#{self.to_s.underscore.pluralize}.#{selector.to_s}.#{identifier}")
    end
  end
  
  def self.included(base)
    base.extend(ClassMethods)
  end
end