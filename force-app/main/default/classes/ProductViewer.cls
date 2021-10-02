public with sharing class ProductViewer {

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts(String filterId) {
        List<String> ids = getProduct2Objects(filterId);
        List<Product2> products = [
          SELECT
            Id,
            Name,
            ProductCode,
            StockKeepingUnit
          FROM
            Product2
          WHERE
            id IN :ids];
        return products;
    }

    private static List<String> getProduct2Objects(String filterId) {
        List<String> result = new List<String>();
        ApexPages.StandardSetController stdSetController = new ApexPages.StandardSetController(
            Database.getQueryLocator([SELECT Id FROM Product2 LIMIT 1])
        );
        stdSetController.setPageSize(1000);
        stdSetController.setFilterId(filterId);

        for (SObject o: stdSetController.getRecords()) {
            String id = (String)o.get('Id');
            result.add(id);
        }

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getListView() {
        List<Map<String, String>> result = new List<Map<String, String>>();
        ApexPages.StandardSetController stdSetController = new ApexPages.StandardSetController(
            Database.getQueryLocator([SELECT Id FROM Product2 LIMIT 1])
        );
        List<SelectOption> listViewOptions = stdSetController.getListViewOptions();
        for (SelectOption option: listViewOptions) {
            String filterId = option.getValue();
            String filterLabel = option.getLabel();

            Map<String, String> m = new Map<String, String>();
            m.put('id', filterId);
            m.put('label', filterLabel);
            result.add(m);
        }

        return result;
    }

    public ProductViewer() {

    }
}
